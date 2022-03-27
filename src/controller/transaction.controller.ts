import http from "http";

import { transactionService } from "../service/transaction.service";

const httpServer =  http.createServer((req, res) => {
    if (req.headers["content-type"] !== "application/json") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end();
        return;
    }
    const reqUrl = new URL(req.url!, `http://${req.headers.host}`);
    const path = reqUrl.pathname;
    const parts = path.split("/").slice(1)
    if (req.method == "POST" && parts[0] == "transactions") {
        let searchParam: string | null | undefined;
        if (parts.length > 1) {
            searchParam = parts[1];
        } else if (reqUrl.searchParams.get("merchantType")) {
            searchParam = reqUrl.searchParams.get("merchantType");
        }
        return searchParam? transactionService(req, res, searchParam):  transactionService(req, res);
      }
})

export { httpServer }