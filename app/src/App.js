import './App.css';
import Papa from 'papaparse';
import React, { useState, useEffect } from "react";
import idl from './assets/idl.json'
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, Provider, web3, utils } from '@project-serum/anchor';
const App = () => {

  const allowedExtensions = ["csv"];
  // It state will contain the error when
  // correct file extension is not used
  const [walletAddress, setWalletAddress] = useState(null);
  const [namesUsers, setnamesUsers] = useState([]);
  const [NftTitle, setNftTitle] = useState([]);
  const [NftSymbol, setNftSymbol] = useState([]);
  const [NftLink, setNftLink] = useState([]);
  // It will store the file uploaded by the user
  const [tableRows, setTableRows] = useState([]);
  const [values, setValues] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const network = clusterApiUrl('devnet');
  // const NftLink = "https://raw.githubusercontent.com/rudranshsharma123/Certificate-Machine/smart-contract-cleon/test.json"
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );
  // Controls how we want to acknowledge when a transaction is "done".
  const opts = {
    preflightCommitment: "processed"
  }
  const programID = new PublicKey(idl.metadata.address);

  // const NftTitle = "Cukc";
  // const NftSymbol = "CUCK";
  const CREATE_MINT_SEED = "createmints";

  // Only call this function once for each wallet address no need to run it again it will fail
  const initializeStorageAccount = async () => {
    const baseAccount = new PublicKey(walletAddress)
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const [pda, _] = await PublicKey.findProgramAddress(
      [
        baseAccount.toBuffer(),
        Buffer.from(utils.bytes.utf8.encode(CREATE_MINT_SEED)),
      ],
      program.programId,
    );
    const txn = await program.methods
      .initializeStorageAccount()
      .accounts({
        storageAccount: pda,
      })
      .rpc();
  }
 
  const mintProcess = async (buyer_address, name_of_nft, symbol_of_nft, metadata_uri, position) => {
    try {
   
      
      const buyer = new PublicKey(buyer_address)
      const baseAccount = new PublicKey(walletAddress)
      console.log(baseAccount)
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      // const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      const mint = Keypair.generate()

      const tokenAddress = await utils.token.associatedAddress({
        mint: mint.publicKey,
        owner: baseAccount,
      });
      const [pda, _] = await PublicKey.findProgramAddress(
        [
          baseAccount.toBuffer(),
          Buffer.from(utils.bytes.utf8.encode(CREATE_MINT_SEED)),
        ],
        program.programId,
      );

      // await initializeStorageAccount();



      // const txn = await program.methods
      //   .initializeStorageAccount()
      //   .accounts({
      //     storageAccount: pda,
      //   })
      //   .rpc();
      console.log(`New token: ${mint.publicKey}`);
      const metadataAddress = (
        await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID,
        )
      )[0];
      console.log("Metadata initialized");
      const masterEditionAddress = (
        await web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.publicKey.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID,
        )
      )[0];
      console.log("Master edition metadata initialized");
      const tx = await program.methods
        .mint(name_of_nft, symbol_of_nft, metadata_uri, baseAccount.publicKey)
        .accounts({
          storageAccount: pda,
          masterEdition: masterEditionAddress,
          metadata: metadataAddress,
          mint: mint.publicKey,
          tokenAccount: tokenAddress,
          mintAuthority: baseAccount,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([mint])
        .rpc();
      console.log("Your transaction signature", tx);

      // console.log("Got the account", account)
      
      const ownerTokenAddress = await utils.token.associatedAddress({
        mint: mint.publicKey,
        owner: baseAccount,
      });
      const buyerTokenAddress = await utils.token.associatedAddress({
        mint: mint.publicKey,
        owner: buyer,
      });
      // console.log(`Request to sell NFT: ${mint} for ${saleAmount} lamports.`);
      console.log(`Owner's Token Address: ${ownerTokenAddress}`);
      console.log(`Buyer's Token Address: ${buyerTokenAddress}`);

      // Transact with the "sell" function in our on-chain program

      await program.methods
        .send()
        .accounts({
          mint: mint.publicKey,
          ownerTokenAccount: ownerTokenAddress,
          ownerAuthority: baseAccount,
          buyerTokenAccount: buyerTokenAddress,
          buyerAuthority: buyer,
        })
        .rpc();
       
    } catch (error) {
      console.log("Error in mintProcess: ", error)
      console.log("Number is ", position);

      // await sleep(1000);
      await mintProcess(recipients[position], NftTitle[position], NftSymbol[position], NftLink[position], position);
      

    }
  }
  // This function will be called when
  // the file input changes
  const { SystemProgram, Keypair } = web3;
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()

          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );
  const sendAddress = async () => {
    var recipients_length = recipients.length;
    let position = 0;
    for (var i = 0; i < recipients_length; i++) {
      console.log(i);
      console.log(namesUsers[i]);
      
      console.log(recipients[i]);
      position = i;

      await mintProcess(recipients[i], NftTitle[i], NftSymbol[i], NftLink[i], position);
    
  }
  };
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
 



  
  const changeHandler =  async (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];
        var string = '';
        const names = [];
        const symbols = [];
        const recipients_to_send = [];
        const link = [];
        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
          recipients_to_send.push(Object.values(d)[1]);
          names.push(Object.values(d)[0]);
          symbols.push(Object.values(d)[3]);
          link.push(Object.values(d)[2]);
          // string +="hello";
        });
        
        setNftLink(link);
        setNftTitle(names);
        setNftSymbol(symbols);
        setTableRows(rowsArray[0]);
        setRecipients(recipients_to_send);
        setValues(valuesArray);
        setnamesUsers(names);
      
        console.log(recipients);
        console.log(string);
        console.log(results.data);
        console.log(rowsArray[0]);
        console.log(valuesArray);
        
      },
      
    });
    // console.log(results.data);
    
    // console.log(values);
    // console.log(tableRows);
    // console.log("hello");
   
  };



  return (
  
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>

        <div className="header-container">
          <p className="header">Certificate Machine</p>
          <p className="sub-text">
           Tool designed to help Institutions and Business to use Solana Blockchain! 
          </p>
        </div>
        <div>{!walletAddress && renderNotConnectedContainer()}</div>
        <div>
          <button className = "cta-button button-to-transfer"  onClick={async () => {
            mintProcess("3UEJXysyw2sWWNFhmjNvXqzMeg4HugiLCErYMxVuHX8W", "Random", "Ninja", "https://raw.githubusercontent.com/rudranshsharma123/Certificate-Machine/smart-contract-cleon/test.json", 0)
          }}>Send NFTs</button>
        </div>
        <div>
          <button className = "cta-button button-to-send"  onClick={async () => {
            sendAddress();
          }}>Send to All Adresses</button>
        </div>
        <div>
          <button className = "cta-button button-to-init"  onClick={async () => {
            initializeStorageAccount();
          }}>Init Account</button>
        </div>
        <div><p className="sub-text">
            Enter a csv file ✨
          </p>
          <input
        type="file"
        name="file"
        className="select-file"
        onChange={changeHandler}
        accept=".csv"
        style={{margin: "10px auto"}}
      />
          <br />
          <br />
          <table className= "styled-table">
     
        <thead className = "styled-table thead tr">
          <tr>
          {/* <p className="minus-text"> */}
          {/* <p className="sub-text"> */}
            {tableRows.map((rows, index) => {
              
              return <th className ="minus-text" key={index}>{rows}</th>;
            })}
          {/* </p> */}
          </tr>
        </thead>
        <tbody>
          {values.map((value, index) => {
            return (
              <tr key={index}>
                {value.map((val, i) => {
                  return <td className="minus-text" key={i}>{val}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
        </div>
      </div>
    <div>
      {/* File Uploader */}
      
      
      {/* Table */}
     
      </div>
    </div>
  //   </Routes>
  // </Router>
 );
};

export default App;
