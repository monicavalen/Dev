import React, { useState, useRef } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import './App.css'; // Import the CSS file
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import config from './config.json';
ModuleRegistry.registerModules([ClientSideRowModelModule]);
const App = () => {
  const apiKey = config.API_KEY;
  
  const [rowData] = useState([
    { name: "John", language: "English", country: "USA", game: "Chess" },
    { name: "Maria", language: "Spanish", country: "Spain", game: "Football" },
    { name: "Pierre", language: "French", country: "France", game: "Tennis" },
    { name: "Hans", language: "German", country: "Germany", game: "Soccer" },
    { name: "Giuseppe", language: "Italian", country: "Italy", game: "Basketball" },
    { name: "Takeshi", language: "Japanese", country: "Japan", game: "Baseball" },
    { name: "Li", language: "Chinese", country: "China", game: "Golf" },
    { name: "Ivan", language: "Russian", country: "Russia", game: "Hockey" },
    { name: "Miguel", language: "Portuguese", country: "Portugal", game: "Rugby" },
    { name: "Ahmed", language: "Arabic", country: "Egypt", game: "Cricket" },
    { name: "punit", language: "English", country: "USA", game: "Chess" },
  ]);
  const gridApiRef = useRef(null);
  const [filterInput, setFilterInput] = useState('');
  const [columnDefs, setColumnDefs] = useState([
    { field: "name", headerName: "Name", sortable: true, filter: true },
    { field: "language", headerName: "Language", sortable: true, filter: true },
    { field: "country", headerName: "Country", sortable: true, filter: true },
    { field: "game", headerName: "Game", sortable: true, filter: true }
  ]);
  const [filteredRowData, setFilteredRowData] = useState(rowData);
  const [openAIResponse, setOpenAIResponse] = useState('');
  const [visualizationData, setVisualizationData] = useState([]);
  const onGridReady = (params) => {
    gridApiRef.current = params.api;
  };
  const handleInputChange = async (e) => {
    setFilterInput(e.target.value);
  };
  const fetchOpenAIResponse = async () => {
    const prompt = `Given the following rows of data in JSON ${JSON.stringify(rowData)}, and a user wants to filter by ${filterInput}. Please provide a JSON array specifying the filtered rows.`;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
          
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are acting as a data assistant helping to filter and process grid data.',
            },
            {
              role: 'user',
              content: prompt,
            }
          ],
          max_tokens: 150
        }),
      });
      const data = await response.json();
      const completion = data.choices[0].message.content.trim();
      setOpenAIResponse(completion);
      visualizeResponse(completion);
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
    }
  };
  const visualizeResponse = (completion) => {
    const startIndex = completion.indexOf('```json');
    const endIndex = completion.lastIndexOf('```');
    const jsonString = completion.substring(startIndex + 7, endIndex).trim();
    try {
      const jsonData = JSON.parse(jsonString);
      if (Array.isArray(jsonData)) {
        setVisualizationData(jsonData);
      } else {
        console.error('Invalid response format:', jsonData);
        alert('Invalid response format. Please try again.');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      alert('Error parsing JSON. Please try again.');
    }
  };
  const applyVisualizationData = () => {
    if (visualizationData.length > 0) {
      // Get the column headers from the first row of visualization data
      const columns = Object.keys(visualizationData[0]);
      // Filter column definitions to include only columns present in the visualization data
      const newColumnDefs = columnDefs.filter(def => columns.includes(def.field));
      setColumnDefs(newColumnDefs);
      setFilteredRowData(visualizationData);
    } else {
      alert('No visualization data available.');
    }
  };
  return (
    <div className="container">
      <div className="ag-theme-quartz" style={{ height: '65vh', width: '100%' }}>
        <AgGridReact
          rowData={filteredRowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
        />
      </div>
      <div className="chat-box">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message here..."
          value={filterInput}
          onChange={handleInputChange}
        />
        <button onClick={fetchOpenAIResponse}>Get Response</button>
        {openAIResponse && (
          <div>
            <p>OpenAI Response: {openAIResponse}</p>
            <div>
              <p>Visualization Data: {JSON.stringify(visualizationData)}</p>
              <button onClick={applyVisualizationData}>Apply Visualization Data</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;