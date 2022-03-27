import http from "http";
import url from "url";

import { httpServer } from "./controller/transaction.controller";

// const httpServer =  http.createServer((req, res) => {
    // if (req.method == "POST" && req.url == "/api/transactions") {
    //     return addTransactionsController(req, res);
    //   }
// })

httpServer.listen(3000, () =>{
    console.log('Server is running on port 3000. Go to http://localhost:3000/');
})

