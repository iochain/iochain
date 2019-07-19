import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import Hub from '../src/Hub'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(chaiHttp)
chai.use(sinonChai)

describe('test/networks.test.js', () => {
    describe('hub server', () => {
        beforeEach(function () {
            sinon.stub(console, 'info').callsFake((msg1, msg2) => {
                return msg1, msg2
            })
        })

        afterEach(function () {
            console.info.restore()
        })

        it('should open at localhost:30309', async () => {
            const port = 30309
            const hub = new Hub()
            await hub.open(port)
            chai
                .request(`localhost:${port}`)
                .get('/')
                .end((err, res) => {
                    expect(res).have.status(200)

                    hub.close()
                })
        })

        it('should not open at an exist port', async () => {

            const port = 30309
            const hub = new Hub()
            await hub.open(port)
            await hub.open(port)
            expect(console.info.calledWith('Hub Server is already running...')).to.be.true

            hub.close()
        })


    })

    describe('peers', () => {
        it('should test console.info', () => {

        })
    })
})