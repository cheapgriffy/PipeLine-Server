const userModel = require("../models/user.model")
const bcrypt = require("bcrypt");
const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const configVariables = require("../config/launch.params").configVariables

// Verify if 8 to 64, lowecase + upper + num and special char
const passwordRegex = /^(?=.{8,64}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/
const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/


const createUser = async (req, res, next) => {
    try{
        if(configVariables.NO_ACCOUNT_CREATION){
            return res.status(403).json({
                error: "Forbidden",
                message: "Account creation is disabled by admin"
            })
        }

        const user_info = { username, email, password } = req.body

        if(!user_info.username || !user_info.email || !user_info.password){
            return res.status(400).json({
                error: "Bad request",
                message: "A provided field is blank",
                template: {
                    "username": "username",
                    "email": "email@example.com",
                    "password": "secret"
                }
            })
        }

        if(!passwordRegex.test(user_info.password)){
            return res.status(400).json({
                error: "Bad request",
                message: "Password must be 8-64 characters and contain a lowercase letter, an uppercase letter, a number, and a special character"
            })
        }
        if(!mailRegex.test(user_info.email)){
            return res.status(400).json({
                error: "Bad Request",
                message: "Invalid email"
            })
        }

        const already_existing = await userModel.getByUsername(user_info.username)
        if(already_existing){
            return res.status(409).json({
                error: "Conflict",
                message: "User already exists"
            })
        }

        const hashed_password = await bcrypt.hash(user_info.password, 8)

        await userModel.createUser(user_info.username, user_info.email, hashed_password)
        res.status(200).json({
            message: "User created succesfully",
            username: user_info.username,
            email: user_info.email
        })

    }catch(err) {
        console.log(err)
        // if email already 
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            error: "Conflict",
            message: "Email already registred" });
        }
        next()
    }
} 

const removeUser = async (req, res, next) => {
    try{
        const remove_requrest = req.body.id || req.userId 

        const current_user = await userModel.getById(req.userId)
        if(current_user.id != remove_request.id && current_user.role_name != "admin"){
            return res.status(403).json({
                error: "Forbidden",
                message: "You are not allowed to remove this user"
            })
        }

        const removed_user = await userModel.removeById(remove_request.id)
        res.status(200).json({
            message: `User ${remove_request.id} removed succesfully`
        })
        
    }catch(err){
        console.log(err)
        next()
    }
}

/**
 * Fetch filtered info from users
 * @returns {id, name, role_id, role_name, created_at}
 */
const getById = async (req, res, next) => {
    try{
        const id = Number(req.params.id)

        const user = await userModel.getById(id)
        user.hashed_password = undefined
        // TODO Edit when email is acually used in app
        user.email = undefined

        return res.status(200).json({user})
    }catch(err){
        console.log(err)
        next()
    }
}

const login = async (req, res, next) => {
    try{
        const user_info = { username, email, password } = req.body

        if(!user_info){
            res.status(401).json({
                error: "Bad Request",
                message: "A username or email and password is required"
            })
        }
        // get user from db by username or email
        const user = await userModel.getByUsername(user_info.username) || await userModel.getByEmail(user_info.email)

        if(!user){
            return res.status(404).json({
                error: "Creditential",
                message: "Invalid credentials"
            })
        }

        // password validation
        const valid_password = await bcrypt.compare(user_info.password, user.hashed_password)
        if(!valid_password){
            return res.status(404).json({
                error: "Creditential",
                message: "Invalid credentials"
            })
        }

        // store db user.id inside token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: configVariables.JWT_EXPIRES_IN}
        )

        res.status(200).json({
            message: "Authentification succesful",
            token
        })
    } catch(err) {
        console.log(err)
        next()
    }
}

const updatePassword = async (req, res, next) => {
    try{
        const body = { old_password, new_password } = req.body
        const user = await userModel.getById(req.userId)

        if(!body.old_password || !body.new_password){
            res.status(401).json({
                error: "Bad Request",
                message: "The old and new password is required"
            })
        }

        const is_valid_password = await bcrypt.compare(body.old_password, user.hashed_password)

        if(!is_valid_password){
            return res.status(401).json({
                error: "Bad Request",
                message: "The old password is incorrect"
            })
        }

        // would throw if not valid
        const ispasswordUpdated = await userModel.updatePassword(req.userId, body.new_password)

        return res.status(200).json({
            message: "Password updated succesfully"
        })

    } catch(err){
        console.log(err)
        next(err)
    }
}

/**
 * Fetch full info from DB about the user that is currently logged in
 * @returns {id, name, email, hashed_password, role_id, role_name, created_at}
 */
const getMe = async (req, res, next) => {
    try{
        const user = await userModel.getById(req.userId)
        return res.status(200).json({user})
    }catch(err){
        console.log(err)
        next(err)
    }
}

module.exports = { createUser, removeUser, getById, login, getMe, updatePassword }