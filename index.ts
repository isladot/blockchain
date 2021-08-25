import { Wallet, Chain } from "./blockchain";

const user1 = new Wallet();
const user2 = new Wallet();
const user3 = new Wallet();

user1.sendMoney(50, user2.publicKey);
user2.sendMoney(23, user3.publicKey);
user3.sendMoney(5, user2.publicKey);

console.log(Chain.instance)