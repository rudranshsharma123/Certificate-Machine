import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import Papa from 'papaparse'
import React, { useState } from "react";
import idl from './idl.json';
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {
  // State to store pa
  const allowedExtensions = ["csv"];
  const [parsedData, setParsedData] = useState([]);
  // It will store the file uploaded by the user
  const [file, setFile] = useState("");
  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);

  //State to store the values
  const [values, setValues] = useState([]);

  const [error, setError] = useState("");
   

   
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
    <div className="container">
    <div className="header-container">
          <p className="header">Certificate Machine📚</p>
          <p className="sub-text">
            Please provide a .csv file ✨
          </p>
        </div>
        <div>
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