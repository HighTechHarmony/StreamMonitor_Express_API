import express from 'express';
import { Request, Response } from 'express';
import {MongoClient} from 'mongodb';
// import body parser
import bodyParser from 'body-parser';

// const express = require('express')

const app = express()

// const uri = "mongodb://localhost:27017"

// Connect to the mongodb database as user streammon_api with password 
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

interface UsersData {
    users: string[];
  }


// Sample json data: {"users": ["userOne", "userTwo", "userThree"]}
const users_json: UsersData = {
    users: ["userOne", "userTwo", "userThree","userFour"]
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


        // This route is the action url that responds with a dump of users json
        // app.get("/api/stream_reports", async (req: Request, res: Response) => {
        //     res.setHeader('Content-Type', 'application/json');
        //     try {
        //         const streams = await db.collection("stream_reports").find({}).toArray()
        //         // Response is the entire dump of streams' report data for each stream, with headers
        //         res.json(streams)
        //         // res.json(users.map((user: any) => ["username":user.username, user.enabled, user.pushover_id, user.pushover_token]
            
        //     }
        //     catch (error) {
        //         console.log(error)                
        //         res.status(500).json({message: "Error retrieving stream reports"})
        //     }
        //     console.log("Got a request for stream reports")
        // })

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
                const stream_titles = req.body.stream_titles
                console.log("Got a request for the last " + req.body.num_alerts + " stream alerts for stream titles: " + stream_titles)
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

        // This will return the image for a given stream title
        // /api/stream_reports/example_stream_title/image
        // app.get("/api/stream_image", async (req: Request, res: Response) => {
        //     res.setHeader('Content-Type', 'application/json');
        //     // console.log("Got a request for stream image for stream title: " + req.query.stream_title)
        //     try {
        //         const stream_title: string = req.query.stream_title as string;
        //         const stream_image = await db.collection("stream_images").findOne({stream: stream_title})
        //         if (stream_image) {
        //             res.json(stream_image.data)
        //         } else {
        //             res.status(404).json({message: "Stream image not found for stream title: " + req.query.stream_title})
        //         }
        //     }
        //     catch (error) {
        //         console.log(error)
        //         res.status(500).json({message: "Error retrieving stream image for stream title: " + req.params.stream_title})
        //     }
        //     console.log("Got a request for stream image for stream title: " + req.params.stream_title)
        // });






            // res.setHeader('Content-Type', 'application/json');
            
            // // If there are stream titles in the body, get the reports for those streams
            // // console.log (req.body)
            // if (req.body.stream_titles) {
            //     try {
            //         const stream_titles = req.body.stream_titles
            //         const streams = await db.collection("stream_reports").find({title: {$in: stream_titles}}).toArray()
            //         res.json(streams)
            //     }
            //     catch (error) {
            //         console.log(error)
            //         res.status(500).json({message: "Error retrieving stream reports for given stream titles"})
            //     }
            //     console.log("Got a request for stream reports for stream titles")
            // } else {
            //     res.status(400).json({message: "No stream titles provided in request body"})
            // }
            // console.log("Got a request for stream reports")
        // })

      


        // This will return all of the current images for all streams
        // /api/stream_images
        app.get("/api/stream_images", async (req: Request, res: Response) => {
            res.setHeader('Content-Type', 'application/json');
            try {
                const stream_images = await db.collection("stream_images").find({}).toArray()
                // console.log("Got some stream images: ", stream_images)
                res.json(stream_images)
            }
            catch (error) {
                console.log(error)
                res.status(500).json({message: "Error retrieving stream images"})
            }
            console.log("Got a request for stream images")
        });



        




        // This will return (up to) the last N alerts for the given stream ID
        // /api/streams/alerts/stream_id/n
        // app.get("/api/streams/alerts/stream_id/n", (req,res) => {
            
        // }

        // This will envoke a restart of the monitoring system
        // /api/backend_restart


        // Start the server on port 5000, and here is a callback function that simply logs an output string
        app.listen(5000, () => {console.log("Server started on port 5000")})


// app.listen(5000, () => {console.log("Server started on port 5000")});
} catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
}
}  // End of connectToDatabase

connectToDatabase();