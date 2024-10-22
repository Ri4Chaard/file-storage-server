const axios = require("axios");
const xmlbuilder = require("xmlbuilder");

exports.sendVerificationCode = async (phone, code) => {
    const xmlRequest = xmlbuilder
        .create("request")
        .ele("auth")
        .ele("login", process.env.LETSADS_LOGIN)
        .up()
        .ele("password", process.env.LETSADS_PASSWORD)
        .up()
        .up()
        .ele("message")
        .ele("from", process.env.LETSADS_SENDER_NAME)
        .up()
        .ele("text", `Ваш код верифікації: ${code}`)
        .up()
        .ele("recipient", "38" + phone)
        .up()
        .end({ pretty: true });

    try {
        const response = await axios.post(
            "https://api.letsads.com",
            xmlRequest,
            {
                headers: { "Content-Type": "application/xml" },
            }
        );
        console.log("SMS sent:", response.data);
    } catch (error) {
        console.error(
            "Error sending SMS:",
            error.response ? error.response.data : error.message
        );
        throw new Error("Failed to send verification SMS.");
    }
};
