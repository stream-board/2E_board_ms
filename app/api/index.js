import { Router } from 'express'
import redisClient from '../services/redis'

const router = new Router()

router.route('/room')
    .post((req, res) => {
        let roomData = {
            admin: req.body.admin,
            drawer: req.body.admin
        }
        redisClient.del(req.body.id, (err, reply) => {
            redisClient.set(req.body.id, JSON.stringify(roomData), (err) => {
                if(err){
                    res.send(err);
                }
                res.json({id: parseInt(req.body.id)});
            });
        })
    })

export default router
