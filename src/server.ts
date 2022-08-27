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

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

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
        return res.status(500).send(e.message);
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