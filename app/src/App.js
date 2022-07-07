import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import Papa from 'papaparse'
import React, { useState } from "react";
import idl from './idl.json';
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

<<<<<<< Updated upstream
function App() {
  // State to store pa
  const allowedExtensions = ["csv"];
  const [parsedData, setParsedData] = useState([]);
  // It will store the file uploaded by the user
  const [file, setFile] = useState("");
  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);
=======
const App = () => {

  const [data, setData] = useState([]);
  const allowedExtensions = ["csv"];
  const [parsedData, setParsedData] = useState([]);
  // It state will contain the error when
  // correct file extension is not used
  const [tableRows, setTableRows] = useState([]);

  //State to store the values
  const [values, setValues] = useState([]);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  // It will store the file uploaded by the user
  const [file, setFile] = useState("");
  const network = clusterApiUrl('devnet');
  const testNftUri = "https://raw.githubusercontent.com/rudranshsharma123/Certificate-Machine/main/test.json"
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );
  // Controls how we want to acknowledge when a transaction is "done".
  const opts = {
    preflightCommitment: "processed"
  }
  const programID = new PublicKey(idl.metadata.address);

  const testNftTitle = "Cukc";
  const testNftSymbol = "CUCK";
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

  const SendNft = async (buyer_address, name_of_nft, symbol_of_nft, metadata_uri) => {
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
      console.log("Error in SendNft: ", error)

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
  
>>>>>>> Stashed changes

  //State to store the values
  const [values, setValues] = useState([]);

<<<<<<< Updated upstream
  const [error, setError] = useState("");
   

   
=======


>>>>>>> Stashed changes
  const changeHandler = (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          
          valuesArray.push(Object.values(d));
        });
        
        // Parsed Data Response in array format
        setParsedData(results.data);

        // Filtered Column Names
        setTableRows(rowsArray[0]);

        // Filtered Values
        setValues(valuesArray);
        console.log(results.data);
        console.log(rowsArray[0]);
        console.log(valuesArray);
        
      },
    });
  };

  return (
    <div className="App">
<<<<<<< Updated upstream
    <div className="container">
    <div className="header-container">
=======
      <div className={walletAddress ? 'authed-container' : 'container'}>

        <div className="header-container">
>>>>>>> Stashed changes
          <p className="header">Certificate Machine📚</p>
          <p className="sub-text">
            Please provide a .csv file ✨
          </p>
        </div>
        <div>
<<<<<<< Updated upstream
=======
          <button className = "button-to-transfer" onClick={async () => {
            SendNft("BEUBokCna6z9fjSyBwfYEkcEMdx6Kbf6MVK1wezJ6omN", testNftTitle, testNftSymbol, testNftUri)
          }}>Send NFT to addresses</button>
        </div>
        <div>
        <p className="sub-text">
            Please provide a .csv file ✨
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
      {/* Table */}
      <table>
     
        <thead>
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
>>>>>>> Stashed changes
      </div>
    <div>
      {/* File Uploader */}
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
      {/* Table */}
      <table>
     
        <thead>
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
    </div>
  );
}

export default App;