//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let access_token_superadmin;
let access_token_admin;
let access_token;

const testOrgId = "5d11f3c84a391408f428e821";
const otherTestOrgId = "5ce662e8f00bfa18bc8928b0";

describe('/POST auth - locale', () => {

  it('it should auth the Superadmin', (done) => {
    chai.request('http://localhost:3001')
      .post('/locale')
      .send({
        client_id: process.env.DEFAULT_CLIENT_ID,
        client_secret: process.env.DEFAULT_CLIENT_SECRET,
        grant_type: 'password',
        username: 'quentin+a0002@wingzy.com',
        password: 'c1secret'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.access_token.should.be.a('string');
        access_token_superadmin = res.body.access_token;
        done();
      });
  });

  it('it should auth the Admin', (done) => {
    chai.request('http://localhost:3001')
      .post('/locale')
      .send({
        client_id: process.env.DEFAULT_CLIENT_ID,
        client_secret: process.env.DEFAULT_CLIENT_SECRET,
        grant_type: 'password',
        username: 'quentin+testadmin2@wingzy.com',
        password: 'c1testadmin'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.access_token.should.be.a('string');
        access_token_admin = res.body.access_token;
        done();
      });
  });

  it('it should auth the User', (done) => {
    chai.request('http://localhost:3001')
      .post('/locale')
      .send({
        client_id: process.env.DEFAULT_CLIENT_ID,
        client_secret: process.env.DEFAULT_CLIENT_SECRET,
        grant_type: 'password',
        username: 'quentin+testuser@wingzy.com',
        password: 'c1test'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.access_token.should.be.a('string');
        access_token = res.body.access_token;
        done();
      });
  });

});

describe('/GET claps', () => {
  it('it should not GET claps (no auth)', (done) => {
    chai.request(server)
      .get('/api/claps')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  it('it should GET claps', (done) => {
    chai.request(server)
      .get('/api/claps')
      .set('Authorization', 'Bearer ' + access_token_superadmin)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('/GET clap', () => {

  it('it should not GET clap (no auth)', (done) => {
    chai.request(server)
      .get('/api/claps/1234')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('it should not GET clap - invalid id', (done) => {
    chai.request(server)
      .get('/api/claps/1234')
      .set('Authorization', 'Bearer ' + access_token_superadmin)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('it should GET clap (superadmin)', (done) => {
    chai.request(server)
      .get('/api/claps/5d1cbc879ce38b4aa0598925')
      .set('Authorization', 'Bearer ' + access_token_superadmin)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('it should GET clap (admin)', (done) => {
    chai.request(server)
      .get('/api/claps/5d1cbc879ce38b4aa0598925')
      .set('Authorization', 'Bearer ' + access_token_admin)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });


  it('it should GET clap (user)', (done) => {
    chai.request(server)
      .get('/api/claps/5d1cbc879ce38b4aa0598925')
      .set('Authorization', 'Bearer ' + access_token)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

});

describe('POST clap', () => {

  it('it should POST clap (superadmin)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
        clap: {
          organisation: testOrgId,
          giver: "5d134105840ec525c88d6d0e",
          recipient: "5d11f3cb4a391408f428e824",
          hashtag: "5d11f50a4a391408f428e827",
          given: 23
        }
      })
      .set('Authorization', 'Bearer ' + access_token_superadmin)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('it should not POST clap (bad clap object)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
        clap: {
          organisation: testOrgId,
          giver: "5d134105840ec525c88d6d0e",
          hashtag: "5d11f50a4a391408f428e827",
          given: 23
        }
      })
      .set('Authorization', 'Bearer ' + access_token_superadmin)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('it should not POST clap (not body param : clap)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
        claping: {
          organisation: testOrgId,
          giver: "5d134105840ec525c88d6d0e",
          recipient: "5d11f3cb4a391408f428e824",
          hashtag: "5d11f50a4a391408f428e827",
          given: 23
        }
      })
      .set('Authorization', 'Bearer ' + access_token_superadmin)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('it should not POST clap (Admin - no clap object)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
      })
      .set('Authorization', 'Bearer ' + access_token_admin)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('it should not POST clap (User - no clap object)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
      })
      .set('Authorization', 'Bearer ' + access_token)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('it should not POST clap (Not the record of the User (giver))', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
        clap: {
          organisation: testOrgId,
          giver: "5d134105840ec525c88d6d0e",
          recipient: "5d11f3cb4a391408f428e824",
          hashtag: "5d11f50a4a391408f428e827",
          given: 23
        }
      })
      .set('Authorization', 'Bearer ' + access_token)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
  });

  it('it should POST clap (User)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
        clap: {
          organisation: testOrgId,
          giver: "5d14a845708dd821d0565b95",
          recipient: "5d11f3cb4a391408f428e824",
          hashtag: "5d11f50a4a391408f428e827",
          given: 23
        }
      })
      .set('Authorization', 'Bearer ' + access_token)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('it should not POST clap (Admin - bad organisation)', (done) => {
    chai.request(server)
      .post('/api/claps')
      .send({
        clap: {
          organisation: otherTestOrgId,
          giver: "5d134105840ec525c88d6d0e",
          recipient: "5d11f3cb4a391408f428e824",
          hashtag: "5d11f50a4a391408f428e827",
          given: 23
        }
      })
      .set('Authorization', 'Bearer ' + access_token_admin)
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });
});