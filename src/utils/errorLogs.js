const fs = require('fs')
const path = require('path')

const logFilePath = path.join(__dirname, '../errorLogs/logs.txt');

const logToFile = (message) =>{
    const timestamp = new Date().toISOString();
     const logEntry = `[${timestamp}] ${message}\n`; 
     fs.appendFile(logFilePath, logEntry, (err) =>{
        if (err) console.error('Error writing log:', err);
     })
}

module.exports = {logToFile}