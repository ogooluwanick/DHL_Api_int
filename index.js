const express = require("express");
const app = express();
const axios = require("axios");
var bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const moment = require("moment");



app.use(cors());
dotenv.config({
        path: "./.env",
});

app.use(bodyParser.json());
app.use(
        bodyParser.urlencoded({
                extended: true,
        })
);
app.use(express.json());
let path = require("path");
app.use("/public", express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );

        if (req.method === "OPTIONS") {
                res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
                return res.status(200).json({});
        }

        next();
});

bodyParser.urlencoded({
        extended: false,
});

const port = process.env.PORT || 3005;
app.listen(port, () => console.log(`App listening on port ${port}`));


let dhl_url = "https://express.api.dhl.com/mydhlapi/test";
const user = process.env.user;
const password = process.env.password;
const account = process.env.account;


app.use("/address-validate", async (req, res) => {
        let { cityName, postalCode, countryCode } = req.query;

         try {
                const response = await axios.get(`${dhl_url}/address-validate`, {
                params: {
                        type: "delivery",
                        cityName,
                        countryCode,
                        postalCode,
                },
                headers: {
                        Authorization:
                        "Basic " + Buffer.from(`${user}:${password}`).toString("base64"),
                },
                });

                res.status(200).send({
                        data: response.data,
                });
        } 
        catch (e) {
                console.log(e);
                res.status(200).send(e);
        }
});

app.use("/rates", async (req, res) => {
  let {  destinationCountryCode, destinationCityName, destinationPostalCode } = req.query;
  
  try {
        const response = await axios.get(`${dhl_url}/rates`, {
                params: {
                        accountNumber: account,
                        originCountryCode: "NG",
                        originPostalCode: "101233",
                        originCityName: "Ikeja",
                        destinationCountryCode,
                        destinationPostalCode,
                        destinationCityName,
                        weight: 2,
                        length: 25,
                        width: 25,
                        height: 15,
                        plannedShippingDate: moment().add(48, 'hours').format('YYYY-MM-DD'), //YYYY-MM-DD
                        isCustomsDeclarable: true, // true or false ---> true (dutiable) and false (non-dutiable)
                        unitOfMeasurement: "metric",
                },
                headers: {
                        Authorization: "Basic " + Buffer.from(`${user}:${password}`).toString("base64"),
                },
        });

    res.status(200).send({
      data: response.data,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send(e);
  }
});

app.use("/create-shipment", async (req, res) => {
        const data = {
                plannedShippingDateAndTime: "2024-02-19T17:10:09 GMT+01:00", //enter date here in this format 2023-03-12T17:10:09 GMT+01:00
                pickup: { isRequested: false, },
                // pickup: {//this info could be used if we need to specify a pickup request
                //   isRequested: true,
                //   pickupDetails: {
                //     postalAddress: {
                //       postalCode: storePostalCode.toString(),
                //       cityName: storeCityName,
                //       countryCode: "BD",
                //       addressLine1: storeAddress1,
                //       addressLine2: storeAddress2,
                //     },
                //     contactInformation: {
                //       email: String(storeEmail),
                //       phone: String(storePhone),
                //       companyName: companyName,
                //       fullName: storeName,
                //     },
                //   },
                //   pickupRequestorDetails: {
                //     postalAddress: {
                //       postalCode: storePostalCode.toString(),
                //       cityName: storeCityName,
                //       countryCode: "BD",
                //       addressLine1: storeAddress1,
                //       addressLine2: storeAddress2,
                //     },
                //     contactInformation: {
                //       email: String(storeEmail),
                //       phone: String(storePhone),
                //       companyName: companyName,
                //       fullName: storeName,
                //     },
                //   },
                // },
                productCode: "D", //Please enter DHL Express Global Product code max:6
                accounts: [{ typeCode: "shipper", number: account }], //enter DHL NUMBER HERE obtain from merchant account of client
                customerDetails: {
                        shipperDetails: {
                                postalAddress: {
                                        postalCode: "1000",
                                        cityName: "Dhaka",
                                        countryCode: "BD",
                                        addressLine1: "storeAddress1",
                                        addressLine2: "storeAddress2",
                                },
                                contactInformation: {
                                        email: "someone@gmail.com",
                                        phone: "93351544124",
                                        companyName: "companyName",
                                        fullName: "storeName",
                                },
                        },
                        receiverDetails: {
                                postalAddress: {
                                        postalCode: "54000",
                                        cityName: "Lahore",
                                        countryCode: "PK",
                                        addressLine1: "userAddress1",
                                        addressLine2: "userAddress2",
                                        countryName: "Pakistan",
                                },
                                contactInformation: {
                                        phone: "6545465456456",
                                        companyName: "userName",
                                        fullName: "userName",
                                },
                        },
                },
                content: {
                        packages: [
                                {
                                        weight: parseFloat(2.0),
                                        dimensions: {
                                                length: parseFloat(2.0),
                                                width: parseFloat(2.0),
                                                height: parseFloat(2.0),
                                        },
                                        customerReferences: [
                                                {
                                                        value: "Customer reference", //required
                                                },
                                        ],
                                },
                        ],
                        isCustomsDeclarable: false, //required

                        description: "shipment description", //required
                        incoterm: "DAP", //required
                        unitOfMeasurement: "metric", //required
                },
                shipmentNotification: [
                        {
                                typeCode: "email", //required
                                receiverId: "some@gmail.com", //required
                                // bespokeMessage: "Your order is assigned to DHL courier service",
                        },
                ],
        };

        try {
                const response = await axios.post(`${dhl_url}/shipments`, data, {
                        auth: {
                                username: user,
                                password: password,
                        },
                });

                res.status(200).send({
                        data: response.data,
                });
        } catch (e) {
                console.log(e.response.data);
                res.status(200).send(e);
        }
});

app.use("/tracking", async (req, res) => {
  const { trackingNum } = req.query;
  try {
    const response = await axios.get(
      `${dhl_url}/shipments/${trackingNum}/tracking`,
      {
        auth: {
          username: user,
          password: password,
        },
      }
    );
    res.status(200).send({
      data: response.data,
    });
  } catch (e) {
    console.log(e.response.data);
    res.status(200).send(e);
  }
});
