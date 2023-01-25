import Web3 from "web3";

let web3 = null;
let LotteryContract = null;
if(window.ethereum){
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();

    let abi =  [{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x481c6a75"},{"constant":false,"inputs":[],"name":"pickWinner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x5d495aea"},{"constant":true,"inputs":[],"name":"getPlayers","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8b5b9ccc"},{"constant":false,"inputs":[],"name":"enter","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0xe97dcb62"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"players","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xf71d96cb"},{"constant":true,"inputs":[],"name":"lastWinner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xfe188184"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"}];
    let contractAddress = "0x0b92BA7E62b41616c2b3F4D56c837c8E9C383D74";
    LotteryContract  = new web3.eth.Contract(abi, contractAddress);
}
export { web3, LotteryContract };

