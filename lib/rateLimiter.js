import redis from "./redisConfig";

export const rateLimiter = async (req, stringType, email, time, limit) => {
    try {
        // get ip adddress for each user for unique key 
        const ip =
            req.headers?.get?.("x-forwarded-for")?.split(",")[0] ||   // route.js ->web api object
            req.headers?.["x-forwarded-for"]?.split(",")[0] ||       // NextAuth -> plain object
             
            
   //     console.log("req in the ratelimiter -> ", req)
        console.log("ip address in rate limiter is  ->", ip);
        // generate key

        const key = `${stringType}:${ip}:${email}`
        console.log("key in the rate limiter redis", key)

        const counter = await redis.incr(key)

        if (counter === 1) {
            // set expiry
            await redis.expire(key, time)
        }
        if (counter > limit) {

            return false;
        }

        return true;
    } catch (error) {
        console.log("error int the rate Limiter ", error)
        return true;
    }
}