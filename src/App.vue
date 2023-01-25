<script setup>
import { web3, LotteryContract } from "./web3";

import { onBeforeMount,ref,computed,inject} from "vue";


//compopnents
import LoadingPage from "./components/LoadingPage.vue";





const swal = inject("$swal");

const contractAddress = ref(null);
const managerAddres  = ref("");
const lastWinner = ref(null);
const prizePool = ref("");
const players = ref([]);
const accounts = ref([]);
const onEnter = ref(false);
const onPickingAWinner = ref(false);

const loading = ref(true);

const prizeEnter = ref("0.01");


const cantPlayers = computed(()=>{
  return players.value.length;
})

const getPrizePoolEth =  computed(()=>{
  if(!web3){
   return;
  }
  const priceStr = prizePool.value.toString();
  return web3.utils.fromWei(priceStr,'ether');
})

onBeforeMount(async()=>{
  if(!web3){
     return;
  }
  contractAddress.value = LotteryContract.options.address;
  managerAddres.value = await LotteryContract.methods.manager().call();
  prizePool.value = await web3.eth.getBalance(contractAddress.value);
  const playersArr = await LotteryContract.methods.getPlayers().call();

  playersArr.map(item =>{
    players.value.push(item);
  })
  lastWinner.value = await LotteryContract.methods.lastWinner().call();
  accounts.value = await web3.eth.getAccounts();
  loading.value = false;
   
})



const userIsManager = computed(()=>{
  return managerAddres.value == accounts.value[0];
})


async function pickAWinner(){
   
   onPickingAWinner.value = true;
    try{
      await LotteryContract.methods.pickWinner().send({
        from: accounts.value[0],
      });
      lastWinner.value = await LotteryContract.methods.lastWinner().call();  //update lastWinner
      prizePool.value = 0;
      onPickingAWinner.value = false;
      players.value = [];
      swal.fire(
        'Pick a Winner!',
        'Winner ' + lastWinner.value,
        'success'
      )
    }catch(e){
      onPickingAWinner.value =false;
    }
}

async function enter(){
  onEnter.value = true;
  try{
    await LotteryContract.methods.enter().send({
      from: accounts.value[0],
      value: web3.utils.toWei(prizeEnter.value,"ether")
    });
    players.value.push(accounts.value[0]);
    prizePool.value = parseFloat(prizePool.value) + parseFloat(web3.utils.toWei(prizeEnter.value,"ether"))
    onEnter.value = false;
    swal.fire(
      'Ticket buyed succesful!',
      'You have buy a new ticket!',
      'success'
    )
  }catch(e){
    onEnter.value = false;
  }
 
}


</script>

<template>
  <template v-if="!web3">
    <div class="flex justify-center items-center w-full h-screen">
      <div class="lg:max-w-full lg:flex">
       
        <div class=" bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
          <div class="mb-8">
           
            <div class="text-gray-900 font-bold text-xl mb-2">Metamask Is Required</div>
            <p class="text-gray-700 text-base">You need install Metamask first for user this app.</p>
          </div>
          <div class="flex items-center">
            <img class="w-40 h-40 rounded-full mr-4" src="./assets/MetaMask_Fox.png" alt="Avatar of Jonathan Reinink">
            <div class="text-sm">
              <p class="text-gray-900 leading-none">Rodrigo Castro</p>
              <p class="text-gray-600">Software Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-if="web3">
    <LoadingPage v-if="loading"></LoadingPage>

    <div class="w-full  bg-gray-100 absolute min-h-screen" v-if="!loading">
      <div class="flex flex-col justify-center w-full  items-center mt-10 px-10">
        <button class="bg-violet-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  md:py-8 text-3xl animate-bounce hover:animate-pulse" @click="enter" :disabled="onEnter || onPickingAWinner">
         <span v-if="!onEnter"> Enter to the Lottery (<span class="text-green-500">{{ getPrizePoolEth }} ETH in Cash  </span>)
          prize:  0.01 ETH</span>
          <span v-if="onEnter"> 
            Entering the lottery, please wait a moment..
            <div role="status">
              <svg aria-hidden="true" class="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span class="sr-only">Loading...</span>
          </div></span>
          <i class="fa-duotone fa-face-tongue-money"></i>
        </button>
  
        <button v-if="userIsManager && players.length > 0" class="md:w-1/4 sm:w-3/4 rounded-full mt-3 bg-red-800 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded md:py-5 py-4  text-3xl  hover:animate-pulse flex justify-center gap-3" @click="pickAWinner" :disabled="onPickingAWinner  || onEnter">
             <span>Pick a Winner</span>
            <div role="status" v-if="onPickingAWinner">
              <svg aria-hidden="true" class="inline w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          </button>
      </div>
      
    
      <div class="flex flex-wrap px-5 mt-10 gap-10">
        <div class="flex-1 max-w-sm lg:max-w-xl">
          <div class="bg-white px-5 py-5 rounded">
            <span class="text-3xl font-medium ">Lottery Contract</span>
            <p class="mb-3 font-light text-gray-900 text-xl mt-3 dark:text-gray-400">This is a smart contract
              that simulates a lottery
              created and implemented in the Rinkeby testnet created by Rodrigo Castro. To use this application the user must have a metamask account with fictitious money loaded in the Rinkeby network, the cost of the ticket is 0.01 ETH
            </p>
  
            <div class="w-full bg-white rounded-lg shadow">
                <ul class="divide-y-2 divide-gray-100">
                    <li class="p-3"><span class="font-medium">Contract address: </span> <br>{{ contractAddress }}</li>
                    <li class="p-3"><span class="font-medium">Last Winner: </span>  <br>{{ lastWinner  }}</li>
                    <li class="p-3"><span class="font-medium">Manager Address: </span> <br> {{ managerAddres }}</li>
                    <li class="p-3"><span class="font-medium">Cantidad de Jugadores: <br>{{ cantPlayers }} </span></li>  
                </ul>
            </div>
          </div>
        </div>
    
        <div class="flex-1 px-5 py-5 md:py-0 ">
          <span class="text-xl font-medium">Players</span>
          <ul class="divide-y divide-gray-200 dark:divide-gray-700 mt-3 overflow-y-scroll max-h-96 px-3" v-if="cantPlayers > 0">
            <li class="pb-3 sm:pb-4" v-for="player in players" :key="player">
  
               <div class="flex items-center space-x-4">
                  
                  <div class="flex-1 min-w-0">
                     <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {{ player }}
                     </p>
                     
                  </div>
                  <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                     0.01 ETH
                  </div>
               </div>
            </li>
         </ul>
  
         <div class="flex justify-center mt-3" v-if="cantPlayers <= 0">
          <div class="w-full flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
            <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
            <p>There aren't players registered</p>
          </div>
         </div>
    
        </div>
      </div>
  
    </div>

  </template>

 
 
  

  
</template>

<style scoped>

</style>
