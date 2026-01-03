const {StateGraph,MessagesAnnotation} = require('@langchain/langgraph')
const {ChatGoogleGenerativeAI} = require('@langchain/google-genai')
const tools = require('../agent/tools.js')
const { ToolMessage ,AIMessage,HumanMessage} = require('@langchain/core/messages')


const model = new ChatGoogleGenerativeAI({
 model:"gemini-2.0-flash",
 temperature:0.7,
 apiKey:process.env.GEMINI_API_KEY
    })


const graph = new StateGraph(MessagesAnnotation)
    .addNode('tools',async(state,config)=>{
      const lastMessage = state.messages[state.messages.length-1]
      const toolcall =  lastMessage.tool_calls 

      const toolCallResult = await Promise.all(toolcall.map(async (call)=>{
    const tool = tools[call.name]
    if(!tool){
      throw new Error(`Tool ${call.name} not found`)
    }
    console.log('Invoking tool:', call.name, 'with input:', call.args,config)
    const toolInput = call.args  
    const toolResult = await tool.func({...toolInput,token:config.metadata.token})
return new ToolMessage({content:toolResult,name:call.name})
  }))
  state.messages.push(...toolCallResult)
  return state
})
.addNode('chat',async(state,config)=>{
  const response = await config.invoke(state.messages,{tools:[tools.SearchProduct,tools.addProductToCart]})

 state.messages.push(new AIMessage({content:response.text,tool_calls:response.tool_calls}))
 return state
})
.addEdge('__start__','chat')
.addConditionalEdges('chat',async(state)=>{
  const lastMessage = state.messages[state.messages.length-1]
  if(lastMessage.tool_calls && lastMessage.tool_calls.length>0){
    return 'tools'
  
  }else{
  return '__end__'}
})
.addEdge('tools','chat')
const agent = graph.compile()


module.exports = agent
