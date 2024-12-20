import express from 'express';
import { Request, Response } from 'express';
import {MongoClient, ObjectId} from 'mongodb';
// import body parser
import bodyParser from 'body-parser';

// const express = require('express')

const app = express()

// const uri = "mongodb://localhost:27017"

// read in the connection URI from external file
const fs = require('fs');
const uri = fs.readFileSync('./db.ini', 'utf8');
console.log("MongoDB URI: " + uri)


const client = new MongoClient(uri)

interface UsersData {
    users: string[];
  }



// Connect to the database
async function connectToDatabase() {
    try {
        await client.connect();
        const db = client.db('streammon');



        // This route is the action url that responds with a dump of users json
        app.get("/api/users", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                const users = await db.collection("users").find({}).toArray()
                // Response is the entire dump of users data for each user, with headers
                res.json(users)
                // res.json(users.map((user: any) => ["username":user.username, user.enabled, user.pushover_id, user.pushover_token]
            
            }
            catch (error) {
                console.log(error)                
                res.status(500).json({message: "Error retrieving users"})
            }
            console.log("Got a request for users")
        })

        // Returns the configs for the streams
        app.get("/api/stream_configs", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                const streams = await db.collection("stream_configs").find({}).toArray()
                // Response is the entire dump of streams' config data for each stream, with headers
                res.json(streams)
            }
            catch (error) {
                console.log(error)                
                res.status(500).json({message: "Error retrieving stream configs"})
            }
            console.log("Got a request for stream configs")
        })



        // Given a list of stream titles, Returns the a list of stream reports for those streams
        // Takes a POST request with a list of stream titles in the body

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));

        app.post("/api/stream_reports", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');

            try {
                const stream_titles = req.body.stream_titles
                console.log("Got a request for stream reports for stream titles: " + stream_titles)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving stream reports for given stream titles"})
            }

            // Return the stream reports for the given stream titles
            try {
                const stream_titles = req.body.stream_titles
                const streams = await db.collection("stream_reports").find({title: {$in: stream_titles}}).toArray()
                res.json(streams)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving stream reports for given stream titles"})
            }
            
        })

        // Returns the most recent stream alerts for the given stream titles
        // Takes a POST request with a list of stream titles in the body
        // And a parameter of the number of alerts to return
        app.post("/api/stream_alerts", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                console.log("Got a request for the last " + req.body.num_alerts + " stream alerts for stream titles: " + req.body.stream_titles)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving stream alerts for given stream titles"})
            }

            // Return the most recent N stream alerts for the given stream titles
            try {
                const stream_titles = req.body.stream_titles
                const num_alerts = req.body.num_alerts
                const streams = await db.collection("stream_alerts").find({stream: {$in: stream_titles}}).sort({timestamp: -1}).limit(num_alerts).toArray()
                res.json(streams)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving stream alerts for given stream titles"})
            }
            
        })


        // Returns Base64 encoded images for the given stream titles, in the format of an object of data with string keys, being stream titles
        app.post("/api/stream_images", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');

            console.log("Got a request for stream images for stream titles: " + req.body.stream_titles)
            

            // Return the stream images for the given stream titles
            try {
                // "title" is actually "stream" in the database
                // Query the DB to get the stream images specified in the request body
                const streams = await db.collection("stream_images").find({stream: {$in: req.body.stream_titles}}).toArray()

                // Create a new object with the stream title and the image data to be returned, so it is in the format:
                /*
                    "StreamOne": {
                        "data": "binary_image_data_here",
                        "timestamp": "2023-10-01T12:00:00Z"
                    },
                    "StreamTwo": {
                        "data": "binary_image_data_here",
                        "timestamp": "2023-10-01T12:05:00Z"
                    },
                    "StreamThree": {
                        "data": "binary_image_data_here",
                        "timestamp": "2023-10-01T12:10:00Z"
                    }
                    }
                */              
                // stream_images is an object with the stream title as the key, 
                // the image data converted to base64 encoding and timestamp as the values
                let stream_images: { [key: string]: { data: string, timestamp: string } } = {}
                streams.forEach((stream) => {
                    // stream_images[stream.stream] = {data: stream.data, timestamp: stream.timestamp}
                    // Convert the image data to a base64 string and put it in along with the timestamp
                    // stream_images[stream.stream] = {data: stream.data.toString('base64'), timestamp: stream.timestamp}

                    // Dump the first 100 characters of initial image data to the console
                    // console.log ("Befdore base64 conversion:")
                    // console.log (stream.data.toString().substring(0,100));
                    let base64data = stream.data.toString('base64');
                    // Dump the first 100 characters of the base64 data to the console
                    // console.log ("After base64 conversion:")
                    // console.log(base64data.substring(0,100));
                    stream_images[stream.stream] = {data: base64data, timestamp: stream.timestamp}
                    
                    
                    
                })
                res.json(stream_images)
                // console.log (streams)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving stream images for given stream titles"})
            }
            
        })


        // Update the global settings
        // Takes a POST request with the new global settings in the body
        app.post("/api/update_global_settings", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                console.log("Got a request to update global settings")
                console.log(req.body)
                // Update the global settings in the database
                await db.collection("global_configs").updateOne({}, {$set: req.body})
                res.json({message: "Global settings updated"})
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error updating global settings"})
            }
        })

        // This will return the global settings
        // /api/global_settings
        app.get("/api/global_settings", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                const global_settings = await db.collection("global_configs").find({}).toArray()
                // console.log("Got some global settings: ", global_settings)
                res.json(global_settings)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving global settings"})
            }
            console.log("Got a request for global settings")
        });


        // Update the stream configs
        // Takes a POST request with the new stream configs in the body
        // /api/update_stream_configs
        app.post("/api/update_stream_configs", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                console.log("Got a request to update stream configs, new configs:")
                console.log(req.body)

                // Do a reasonable job of ensuring this data is valid
                // Check that the body is an array
                if (!Array.isArray(req.body)) {
                    res.status(400).json({message: "Invalid stream configs data"})
                    console.log("Invalid stream configs data")
                    return
                }

                // Check that each of the stream configs interface is represented in the submission
                if (!req.body.every((config: any) => 
                    config.hasOwnProperty("_id") &&
                    config.hasOwnProperty("title") &&
                    config.hasOwnProperty("uri") &&
                    config.hasOwnProperty("audio") &&
                    config.hasOwnProperty("enabled")
                )) {
                    res.status(400).json({message: "Incompatible stream config data"})
                    console.log("Incompatible stream config data")
                    return
                }
                
                // Update each stream config in the database
                for (const config of req.body) {
                    const existingConfig = await db.collection("stream_configs").findOne({ _id: new ObjectId(config._id) });
                    console.log("Existing config:", existingConfig);
                
                    console.log("Updating with:", {
                        title: config.title,
                        uri: config.uri,
                        audio: config.audio,
                        enabled: config.enabled
                    });
                
                    const result = await db.collection("stream_configs").updateOne(
                        { _id: new ObjectId(config._id) },
                        {
                            $set: {
                                title: config.title,
                                uri: config.uri,
                                audio: config.audio,
                                enabled: config.enabled
                            }
                        }
                    );
                    console.log("Update result:", result);
                
                    // Return an error if the entry was different but not updated
                    if (result.matchedCount === 0) {
                        res.status(400).json({message: "Stream config " + config.title + " not found"})
                        console.log("Stream config " + config.title + " not found")
                        return
                    }
                }
                res.json({message: "Stream configs updated"})
                console.log("Stream configs updated")
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error updating stream configs"})
            }
        })  // End of update_stream_configs

        // Similar to the above, but for users
        // Update the user configs
        // Takes a POST request with the new user configs in the body
        // /api/update_user_configs
        
        app.post("/api/update_users", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                console.log("Got a request to update user configs, new configs:")
                console.log(req.body)

                // Do a reasonable job of ensuring this data is valid
                // Check that the body is an array
                if (!Array.isArray(req.body)) {
                    res.status(400).json({message: "Invalid user configs data"})
                    console.log("Invalid user configs data")
                    return
                }

                // Check that each of the user configs interface is represented in the submission
                if (!req.body.every((config: any) => 
                    config.hasOwnProperty("_id") &&
                    config.hasOwnProperty("username") &&
                    config.hasOwnProperty("enabled") &&
                    config.hasOwnProperty("pushover_id") &&
                    config.hasOwnProperty("pushover_token")
                )) {
                    res.status(400).json({message: "Incompatible user config data"})
                    console.log("Incompatible user config data")
                    return
                }
                
                // Update each user config in the database
                for (const config of req.body) {
                    const existingConfig = await db.collection("users").findOne({ _id: new ObjectId(config._id) });
                    console.log("Existing config:", existingConfig);
                
                    console.log("Updating with:", {
                        username: config.username,
                        enabled: config.enabled,
                        pushover_id: config.pushover_id,
                        pushover_token: config.pushover_token
                    });
                
                    const result = await db.collection("users").updateOne(
                        { _id: new ObjectId(config._id) },
                        {
                            $set: {
                                username: config.username,
                                enabled: config.enabled,
                                pushover_id: config.pushover_id,
                                pushover_token: config.pushover_token
                            }
                        }
                    );
                    console.log("Update result:", result);
                
                    // Return an error if the entry was different but not updated
                    if (result.matchedCount === 0) {
                        res.status(400).json({message: "User config " + config.username + " not found"})
                        console.log("User config " + config.username + " not found")
                        return
                    }
                }
                res.json({message: "User configs updated"})
                console.log("User configs updated")
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error updating user configs"})
            }
        }
        )  // End of update_user_configs



        // Start the server on port 5000, and here is a callback function that simply logs an output string
        app.listen(5000, () => {console.log("Server started on port 5000")})


// app.listen(5000, () => {console.log("Server started on port 5000")});
} catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
}
}  // End of connectToDatabase

connectToDatabase();