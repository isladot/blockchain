import * as crypto from 'crypto';

export class Transaction {
  constructor(
    public amount: number,
    public sender: string, //Public Key
    public receiver: string, //Public Key
  ) {}

  toString() {
    return JSON.stringify(this);
  }
}

export class Block {
  public nonce = Math.round(Math.random() * 999999999)

  constructor(
    public prevBlockHash: string,
    public transaction: Transaction,
    public timestamp = Date.now()
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash('SHA256');
    hash.update(str).end();
    return hash.digest('hex');
  }
}

export class Chain {
  public static instance = new Chain();

  chain: Block[];

  constructor() {
    this.chain = [new Block('', new Transaction(100, 'me', 'you'))];
  }

  get lastBlock() {
    return this.chain[this.chain.length -1];
  }

  mine(nonce: number){
    let solution = 1;
    console.log('⛏️ Mining...');

    while(true) {
      const hash = crypto.createHash('MD5');
      hash.update((nonce + solution).toString()).end();

      const attempt = hash.digest('hex');

      if(attempt.substr(0, 4) === '0000'){
        console.log(`Solved: ${solution}`);
        return solution;
      }

      solution++;
    }
  }

  addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(transaction.toString()).end();

    const isValid = verifier.verify(senderPublicKey, signature);

    if(isValid){
      const newBlock = new Block(this.lastBlock.hash, transaction);
      this.mine(newBlock.nonce);
      this.chain.push(newBlock);
    }
  }
}

export class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor() {
    const keypair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {type: 'spki', format: 'pem'},
      privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
    });

    this.publicKey = keypair.publicKey;
    this.privateKey = keypair.privateKey;
  }

  sendMoney(amount: number, receiverPublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, receiverPublicKey);

    const sign = crypto.createSign('SHA256');
    sign.update(transaction.toString()).end();

    const signature = sign.sign(this.privateKey);
    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}
