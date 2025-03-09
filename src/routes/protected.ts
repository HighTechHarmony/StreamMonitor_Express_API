
import { Router, Request, Response } from 'express';
import { connectToDatabase } from '../db'; // Import the getDb function from your db module
import { authMiddleware } from '../middlewares/auth';
import { User } from '../models/User';
import { StreamConfig } from '../models/StreamConfig';
import { StreamReport } from '../models/StreamReport';
import { StreamImage } from '../models/StreamImage';
import { StreamAlert } from '../models/StreamAlert';
import { globalConfigs } from '../models/GlobalConfigs';
import { Stream } from 'stream';

const router = Router();

// This route is the action url that responds with a dump of users json
router.get("/api/users", authMiddleware, async (req: Request, res: Response) => {
    console.log("/api/users: Got a request for users");

    res.setHeader('Content-Type', 'application/json');
    try {
        const users = await User.find({});
        // Response is the entire dump of users data for each user, with headers
        res.json(users)
        // res.json(users.map((user: any) => ["username":user.username, user.enabled, user.pushover_id, user.pushover_token]
    
    }
    catch (error) {
        console.log(error)                
        res.status(500).json({message: "Error retrieving users"})
    }
    
})

// Returns the configs for the streams
router.get("/api/stream_configs", authMiddleware, async (req: Request, res:
    Response) => {
    console.log("Got a request for stream configs");

    const db = await connectToDatabase(); // Get the database connection    

    res.setHeader('Content-Type', 'application/json');
    try {
        const streams = await StreamConfig.find({});
        // if (streams.length > 0) {
        //     console.log ("Got some stream configs: ", streams)
        // }
        // Response is the entire dump of streams' config data for each stream, with headers
        res.json(streams)
    }
    catch (error) {
        console.log(error)                
        res.status(500).json({message: "Error retrieving stream configs"})
    }
    
})



    // Given a list of stream titles, Returns the a list of stream reports for those streams
    // Takes a POST request with a list of stream titles in the body

    

    router.post("/api/stream_reports", authMiddleware, async (req: Request, res: Response) => {
        console.log("Got a request for stream reports");

        const db = await connectToDatabase(); // Get the database connection    

        res.setHeader('Content-Type', 'application/json');

        try {
            const stream_titles = req.body.stream_titles
            // console.log("Got a request for stream reports for stream titles: " + stream_titles)
        }
        catch (error) {
            console.log(error)
            res.status(404).json({message: "Error retrieving stream reports for given stream titles"})
        }

        // Return the stream reports for the given stream titles
        try {
            const stream_titles = req.body.stream_titles
            // const streams = await db.collection("stream_reports").find({title: {$in: stream_titles}}).toArray()
            const streams = await StreamReport.find({title: {$in: stream_titles}})
            res.json(streams)
        }
        catch (error) {
            console.log(error)
            res.status(500).json({message: "Error retrieving stream reports for given stream titles"})
        }
        
    })




    // Returns Base64 encoded images for the given stream titles, in the format of an object of
    // data with string keys, being stream titles
    router.post("/api/stream_images", authMiddleware, async (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');

        console.log("Got a request for stream images for stream titles: " + req.body.stream_titles)
        
        // For now just return a random image from the data model
        const stream_images = await StreamImage.find({stream: {$in: req.body.stream_titles}})
        

        // Return the stream images for the given stream titles
        try {
            // "title" is actually "stream" in the database
            // Query the DB to get the stream images specified in the request body
            // const streams = await db.collection("stream_images").find({stream: {$in: req.body.stream_titles}}).toArray()
            const streams = await StreamImage.find({stream: {$in: req.body.stream_titles}});
            // console.log("Got some stream images: ", streams);


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
            streams.forEach((stream: any) => {                
                let base64data = stream.data.toString('base64');                
                stream_images[stream.stream] = {data: base64data, timestamp: stream.timestamp}            
            })
            res.json(stream_images)
            // console.log (streams)
        }
        catch (error) {
            console.log(error)
            res.status(404).json({message: "Error retrieving stream images for given stream titles"})
        }
        
    })



//     // Returns the most recent stream alerts for the given stream titles
//     // Takes a POST request with a list of stream titles in the body
//     // And a parameter of the number of alerts to return
    router.post("/api/stream_alerts", authMiddleware, async (req: Request, res: Response) => {
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
            // const streams = await db.collection("stream_alerts").find({stream: {$in: stream_titles}}).sort({timestamp: -1}).limit(num_alerts).toArray()
            const streams = await StreamAlert.find({stream: {$in: stream_titles}}).sort({timestamp: -1}).limit(num_alerts)
            const streamsWithBase64Images = streams.map((stream: any) => {
                // Convert the image data to base64 encoding
                let base64data = stream.image.toString('base64');
                // Return the stream alert with the image data converted to base64 encoding
                return {
                    stream: stream.stream,
                    timestamp: stream.timestamp,
                    alert: stream.alert,
                    image: base64data
                }
            })
            res.json(streamsWithBase64Images);
        }
        catch (error) {
            console.log(error)
            res.status(500).json({message: "Error retrieving stream alerts for given stream titles"})
        }
        
    })

    // Update the global settings
    // Takes a POST request with the new global settings in the body
    router.post("/api/update_global_settings", authMiddleware, async (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        try {
            console.log("Got a request to update global settings")
            console.log(req.body)
            // Update the global settings in the database
            // await db.collection("global_configs").updateOne({}, {$set: req.body})
            await globalConfigs.updateOne({ $set: req.body })

            res.json({message: "Global settings updated"})
        }
        catch (error) {
            console.log(error)
            res.status(500).json({message: "Error updating global settings"})
        }
    })

    // This will return the global settings
    // /api/global_settings
    router.get("/api/global_settings", authMiddleware, async (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        try {
            // const global_settings = await db.collection("global_configs").find({}).toArray()
            // console.log("Got some global settings: ", global_settings)
            const global_settings = await globalConfigs.find({})
            res.json(global_settings)
        }
        catch (error) {
            console.log(error)
            res.status(500).json({message: "Error retrieving global settings"})
        }
        console.log("Got a request for global settings")
    });



// Delete a stream by streamId
router.post("/api/delete_stream", authMiddleware, async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        console.log("Got a request to delete stream with ID: " + req.body.streamId)
        
        
        const result = await StreamConfig.deleteOne({ streamId: req.body.streamId });
        console.log("Delete result:", result);
        // Return an error if the stream was not found
        if (result.deletedCount === 0) {
            res.status(400).json({ message: "Stream with streamId " + req.body.streamId + " not found" });
            console.log("Stream with streamId " + req.body.streamId + " not found");
            return;
        }
        res.json({ message: "Stream deleted" });
        console.log("Stream deleted");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting stream" });
    }
}
)  // End of delete_stream

// Update the stream configs
// Takes a POST request with the new stream configs in the body
// /api/update_stream_configs
router.post("/api/update_stream_configs", authMiddleware, async (req: Request, res: Response) => {
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


        // Check that each of the stream configs interface is represented AND VALID in the submission
        // The title should should be a string with a length of at least 1
        // The uri should be a string starting with a resource identifier (http, https, and all resource identifiers valid for ffmpeg)
        // The audio should be a string with a length of 1
        // The enabled should be a string with a length of 1
        // The streamId should be a string with a length of at least 3
        if (!req.body.every((config: any) => 
            config.hasOwnProperty("title") && typeof config.title === "string" && config.title.length > 0 &&
            // uri must start with one of the following resource identifiers: (http, https, rtsp, rtp, udp, mms, file)
            config.hasOwnProperty("uri") && typeof config.uri === "string" && config.uri.match(/^(http|https|rtsp|rtp|udp|mms|file):\/\//) &&
            config.hasOwnProperty("audio") && typeof config.audio === "string" && config.audio.length === 1 &&
            config.hasOwnProperty("enabled") && typeof config.enabled === "string" && config.enabled.length === 1 &&
            config.hasOwnProperty("streamId") && typeof config.streamId === "string" && config.streamId.length > 2
        )) {
            res.status(400).json({message: "Incompatible stream config data"});
            console.log("Incompatible stream config data");
            return;
        }
        
        
        
        // Update each stream config in the database
        for (const config of req.body) {
            // const existingConfig = await db.collection("stream_configs").findOne({ _id: new ObjectId(config._id) });
            const existingConfig = await StreamConfig.findOne({ streamId: config.streamId });
            console.log("Existing config:", existingConfig);
        
            console.log("Updating with:", {
                title: config.title,
                uri: config.uri,                
                audio: config.audio,
                enabled: config.enabled,
                streamId: config.streamId
            });
        
            const result = await StreamConfig.updateOne(
                { streamId: config.streamId },
                {
                    $set: {
                        title: config.title,
                        uri: config.uri,
                        audio: config.audio,
                        enabled: config.enabled,
                        streamId: config.streamId                        
                    }
                },
                { upsert: true }
            );
            console.log("Update result:", result);
        
            // Return an error if the entry was different but not updated
            // if (result.matchedCount === 0) {
            //     res.status(400).json({message: "Stream config for " + config.streamId + " not found"})
            //     console.log("Stream config " + config.streamId + " not found")
            //     return
            // }
        }
        res.json({message: "Stream configs updated"})
        console.log("Stream configs updated")
    }
    catch (error) {
        console.log(error)
        res.status(500).json({message: "Error updating stream configs"})
    }
})  // End of update_stream_configs

router.post("/api/delete_stream", authMiddleware, async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        console.log("Got a request to delete stream with streamId: " + req.body.streamId)
        // Delete the Stream with the given Id
        const result = await StreamConfig.deleteOne({ streamId: req.body.streamId });
        console.log("Delete result:", result);
        // Return an error if the stream was not found
        if (result.deletedCount === 0) {
            res.status(400).json({ message: "Stream with streamId " + req.body.streamId + " not found" });
            console.log("Stream with streamId " + req.body.streamId + " not found");
            return;
        }
        res.json({ message: "Stream deleted" });
        console.log("Stream deleted");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting Stream" });
    }
}
)  // End of delete_stream

// Similar to the above, but for users
// Update the user configs
// Takes a POST request with the new user configs in the body
// /api/update_user_configs

router.post("/api/delete_user", authMiddleware, async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        console.log("Got a request to delete user with userId: " + req.body.userId)
        // Delete the user with the given userId
        const result = await User.deleteOne({ userId: req.body.userId });
        console.log("Delete result:", result);
        // Return an error if the user was not found
        if (result.deletedCount === 0) {
            res.status(400).json({ message: "User with userId " + req.body.userId + " not found" });
            console.log("User with userId " + req.body.userId + " not found");
            return;
        }
        res.json({ message: "User deleted" });
        console.log("User deleted");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting user" });
    }
}
)  // End of delete_user

router.post("/api/update_users", authMiddleware, async (req: Request, res: Response) => {
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
            config.hasOwnProperty("userId") &&
            config.hasOwnProperty("username") &&
            config.hasOwnProperty("enabled") &&
            config.hasOwnProperty("pushover_id") &&
            config.hasOwnProperty("pushover_token")
        )) {
            res.status(400).json({message: "Incompatible user config data"})
            console.log("Incompatible user config data")
            return
        }
        
        // Update or insert each user config in the database
        for (const config of req.body) {
            console.log("Updating with:", {
                username: config.username,
                enabled: config.enabled,
                pushover_id: config.pushover_id,
                pushover_token: config.pushover_token,
                password: config.password,
                userId: config.userId
            });

            const result = await User.updateOne(
                { userId: config.userId }, // Use userId to identify the user
                {
                    $set: {
                        username: config.username,
                        enabled: config.enabled,
                        pushover_id: config.pushover_id,
                        pushover_token: config.pushover_token,
                        password: config.password
                    }
                },
                { upsert: true } // Use upsert to insert a new document if no match is found
            );

            console.log("Update result:", result);

            // Return an error if the entry was different but not updated
            if (result.matchedCount === 0 && result.upsertedCount === 0) {
                res.status(400).json({ message: "User config " + config.username + " not found" });
                console.log("User config " + config.username + " not found");
                return;
            }
        }
        res.json({ message: "User configs updated" });
        console.log("User configs updated");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user configs" });
    }
}
)  // End of update_user_configs



export default router;