import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import Papa from 'papaparse'
import React, { useState, useEffect } from "react";
import idl from './assets/idl.json'
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, Provider, web3, utils } from '@project-serum/anchor';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [data, setData] = useState([]);
  const allowedExtensions = ["csv"];
  // It state will contain the error when
  // correct file extension is not used
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

  const getGifList = async (buyer_address, name_of_nft, symbol_of_nft, metadata_uri) => {
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
      console.log("Error in getGifList: ", error)

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

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);




  const handleFileChange = (e) => {
    setError("");

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      // If input type is correct set the state
      setFile(inputFile);
    }
  };
  const handleParse = () => {

    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();

    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      console.log(parsedData)
      const columns = Object.keys(parsedData[0]);
      setData(columns);
    };
    reader.readAsText(file);
  };



  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>

        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
        </div>
        <div>{!walletAddress && renderNotConnectedContainer()}</div>
        <div>
          <button onClick={async () => {
            getGifList("8QCJWmu1gErc9zRFtww9Bo4R7bne58YGvL4YZRGbSeX9", testNftTitle, testNftSymbol, testNftUri)
          }}>hello</button>
        </div>
        <div>
          <label htmlFor="csvInput" style={{ display: "block" }}>
            Enter CSV File
          </label>
          <input
            onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
          />
          <div>
            <button onClick={handleParse}>Parse</button>
          </div>
          <div style={{ marginTop: "3rem" }}>
            {error ? error : data.map((col,
              idx) => <div key={idx}>{col}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
