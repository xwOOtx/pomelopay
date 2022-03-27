// handle requests and reponses
import { ServerResponse, IncomingMessage } from "http";

interface ITransaction {
    transactionId: string;
    orderId: string;
    merchantId: string;
    merchantType: string;
    value: number;
}

class Summary {
    merchantId?: string;
    grossSales?: number;
    netSales?: number;
    averageOrderValue?: number;

    constructor(merchantId: string, grossSales: number, netSales: number, averageOrderValue: number) {
        this.merchantId = merchantId;
        this.grossSales = grossSales;
        this.netSales = netSales;
        this.averageOrderValue = averageOrderValue;
    }
}


const transactionService = async(req: IncomingMessage, res: ServerResponse, searchParam?: string) => {
    let transactionInfo: { [merchantId: string] : { grossSales?: number,
                                                    netSales?: number,
                                                    averageOrderValue?: number,
                                                    totalOrderId?: string[]} } = {};
    let data = "";
    const merchantType = searchParam;
    let output:Summary[] = [];

    req.on("data", (chunk) => {
        data += chunk.toString();
    })

    req.on("end", () => {
        const transactions: ITransaction[] = JSON.parse(data);
        // if (!transactions.has("transactionId") ||
        //     !transactions.has("orderId") ||
        //     !transactions.has("merchantId") ||
        //     !transactions.has("merchantType") ||
        //     !transactions.has("value")) {
        //     res.writeHead(500, { "Content-Type": "application/json" });
        //     res.end(
        //         JSON.stringify({
        //         success: false
        //         })
        //     );
        //     return;
        // }
        let filteredTransaction: ITransaction[] = merchantType? transactions.filter(x => x.merchantType == merchantType) : transactions;
        if (filteredTransaction) {
            filteredTransaction.forEach(item => {
                if (transactionInfo[item.merchantId]) {
                    /// exist, add on
                    if (item.value > 0) {
                        /// payment
                        transactionInfo[item.merchantId].grossSales = transactionInfo[item.merchantId].grossSales! + item.value;
                        transactionInfo[item.merchantId].netSales = transactionInfo[item.merchantId].netSales! + item.value;
                        if (!(transactionInfo[item.merchantId].totalOrderId?.includes(item.orderId))) {
                            transactionInfo[item.merchantId].totalOrderId?.push(item.orderId);
                        }
                        transactionInfo[item.merchantId].averageOrderValue = transactionInfo[item.merchantId].grossSales! / transactionInfo[item.merchantId].totalOrderId!.length;
                    } else {
                        /// refund
                        transactionInfo[item.merchantId].netSales = transactionInfo[item.merchantId].netSales! + item.value;
                    }
                } else {
                    /// new entry
                    if (item.value > 0) {
                        /// payment
                        transactionInfo[item.merchantId] = {grossSales: item.value, 
                                                            netSales: item.value, 
                                                            averageOrderValue: item.value, 
                                                            totalOrderId: [item.orderId]}
                    } else {
                        /// refund
                        transactionInfo[item.merchantId] = {netSales: item.value}
                    }
                }
            })

            Object.entries(transactionInfo).forEach( ([key, value]) => {
                let summary = new Summary(key, value.grossSales!, value.netSales!, value.averageOrderValue!);
                output.push(summary);
            });

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify(output)
            );
        } else {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end();
        }
    })
}

export { transactionService };