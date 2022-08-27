import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, isValidURL} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // "/filteredimage" enpoint to get image URL from query, download image, filter it and resend to the client
  app.get( "/filteredimage/", async ( req: express.Request, res: express.Response) => {
    try{
      // Get the image URL from the query
      const image_url  = req.query.image_url as string;

      if(!image_url){
          //Return status 400, if the image URL string is empty
          return res.status(400).send('No URL was submitted! Please submit a URL with the query');
      }
      // Helper function to check for the validity of the URL
      const checkurl = await isValidURL(image_url);
      if(checkurl===false){
          //Return Status 415, if image URL is malformed / not supported
          return res.status(415).send('This IMG or URL is not supported.');
      }
      // Use helper function to download picture and filter from image url
      const filteredImage = await filterImageFromURL(image_url);
      // Send filtered file with Statuscode 200     
      res.status(200).sendFile(filteredImage);
      // Add file to files array and submit for deletion
      let files: Array<string> =[filteredImage]; 
      // Use helper function to delete all files
      res.on('finish', async () => await deleteLocalFiles(files));
    } catch (error){
        return res.status(500).send(error.message);
    }

  } );

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();