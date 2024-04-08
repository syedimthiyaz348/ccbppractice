const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const databasePath = path.join(__dirname, 'cricketMatchDetails.db')
let database = null
const initalizeDB = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log('DB Error: ${e.message}')
    process.exit(1)
  }
}
initalizeDB()

const names = data => {
  return {
    playerId: data.player_id,
    playerName: data.player_name,
  }
}

app.get('/players/', async (request, response) => {
  const api1 = `
            SELECT 
                player_id AS playerId,
                player_name AS playerName
             FROM player_details;`
  const db1 = await database.all(api1)
  response.send(db1)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
            SELECT 
                player_id AS playerId,
                player_name AS playerName
             FROM player_details
            WHERE player_id = ${playerId};`
  const player = await database.get(getPlayerQuery)
  response.send(player)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const api3 = `UPDATE player_details
    SET player_name ='${playerName}'
    WHERE player_id = ${playerId};`
  const db3 = await database.run(api3)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const api4 = `
        SELECT 
            match_id AS matchId,
            match, year
         FROM match_details
        WHERE match_id = ${matchId};`
  const db4 = await database.get(api4)
  response.send(db4)
})

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params
  const exampleApi = `
            SELECT 
                match_id AS matchId,
                match,
                year
             FROM player_match_score NATURAL JOIN match_details
             WHERE player_id = ${playerId};`
  const ex = await database.all(exampleApi)
  response.send(ex)
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const exampleApi = `SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`
  const ex = await database.all(exampleApi)
  response.send(ex)
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const exampleApi = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes  
    FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id

    WHERE player_details.player_id = ${playerId};
    `
  const ex = await database.get(exampleApi)
  response.send(ex)
})

module.exports = app