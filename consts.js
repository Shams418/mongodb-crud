export const appConfig= {
    port:process.env.PORT,
    jwt_secret:process.env.JWT_SECRET,
    email:process.env.EMAIL,
    email_pass:process.env.EMAIL_PASS,
    mongo_url:process.env.MONGO_URL,
    verifyExpiredIN:process.env.VERIFYCODEEXPIREDIN,
    clientBaseUrl:process.env.CLIENT_URL

}