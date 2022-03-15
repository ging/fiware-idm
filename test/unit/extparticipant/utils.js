/* eslint-env mocha */
/* eslint-disable snakecase/snakecase */

require('should');
const forge = require('node-forge');
const sinon = require("sinon");

// Load test configuration
const config_service = require('../../../lib/configService.js');
config_service.set_config(require('../../config-test'));
const config = config_service.get_config();

const utils = require('../../../controllers/extparticipant/utils');


const CERTIFICATE_WITH_SPECIAL_CHARACTERS = forge.pki.certificateFromPem(String.raw`
Bag Attributes
localKeyID: 2D 6D DC 77 04 DA 21 84 F3 95 47 21 D2 F4 74 39 4F 2A 0F 47
friendlyName: Dennis@#-_+'|\/:,/,âäàåáãÀÁÂÃÄÅçÇ
subject=CN = "Dennis@#-_+'|\\/:,/,\C3\A2\C3\A4\C3\A0\C3\A5\C3\A1\C3\A3\C3\80\C3\81\C3\82\C3\83\C3\84\C3\85\C3\A7\C3\87", serialNumber = EU.EORI.DennisWendlandSpecialCharactersTest2, O = FIWARE, C = NL

issuer=CN = TEST iSHARE EU Issuing Certification Authority G5

-----BEGIN CERTIFICATE-----
MIIEBDCCAuygAwIBAgIIVRsdqFaIjZ4wDQYJKoZIhvcNAQELBQAwPDE6MDgGA1UE
AwwxVEVTVCBpU0hBUkUgRVUgSXNzdWluZyBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0
eSBHNTAeFw0yMTA5MzAxNDE0MDNaFw0yMzA5MzAxNDE0MDNaMIGPMTgwNgYDVQQD
DC9EZW5uaXNAIy1fKyd8XC86LC8sw6LDpMOgw6XDocOjw4DDgcOCw4PDhMOFw6fD
hzE1MDMGA1UEBRMsRVUuRU9SSS5EZW5uaXNXZW5kbGFuZFNwZWNpYWxDaGFyYWN0
ZXJzVGVzdDIxDzANBgNVBAoMBkZJV0FSRTELMAkGA1UEBhMCTkwwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCUEa8DpaBOm7990WJDiSnBvXxMlyjCgonG
NM+E+ntE+pEwrL54tl99sL4f6E0hDI62Ebh0DJjkB9z37MaUPpnYSHaOuIMl+Glk
WxROw4y9HmRp9ltrC04MYVa5yGVRUVePC+YhD6RE5Gm62VHHcbDyefFtEKNyi+MN
yPZiNyi//Q/nlDxjs54uSkRs4CIfm3tJHF4pAPCrDRd2p04Oxqtlx5+3QAaTPT+q
zi4DEgBRT8Xq0TGvE0EPyShu3yxQoTckmIZdbReLKUmQeYM1JQPqelEhUksJgFp7
ZXoDMx0+laiT5Wdmms/dPQKJP+mmwf0NRlgbYPOfmaM9zWqsy/43AgMBAAGjgbUw
gbIwHwYDVR0jBBgwFoAUbcVlicvfkVTRazy3AqUuzYpokB0wJwYDVR0lBCAwHgYI
KwYBBQUHAwIGCCsGAQUFBwMEBggrBgEFBQcDATA3BggrBgEFBQcBAwQrMCkwCAYG
BACORgEBMAgGBgQAjkYBBDATBgYEAI5GAQYwCQYHBACORgEGAjAdBgNVHQ4EFgQU
LW3cdwTaIYTzlUch0vR0OU8qD0cwDgYDVR0PAQH/BAQDAgbAMA0GCSqGSIb3DQEB
CwUAA4IBAQB+uy1fto2sbKplJ4zHrZJixNsFANA2Jp+hyL/w6JkvwcpOCLj7CaMM
RA5hR01Mg+cpItc4fU+RfBpE8uonDOKtun5IedMLA27RzWLMDczxecKUu5SJxSpk
/a9rrTAlwf0Y8VoaPOZajJZi82hX3M1I1lcpPSihdon73jJNEZzbw549X1QBw3oJ
HGQFozyfNpx51hlNdvcnNPorrGV1wlvzTKbfBlAFBiVWxcWiI1vmr1FVWHBIZTru
G9HeTZHJLhhoizeE6fuZiJDY+M4RuslYGnsQeT+BQZzv0OrvPKyGHTp8qqS8YXLA
WSoJh6M4FirBZJigdIsebUezVZEVBLvD
-----END CERTIFICATE-----`);


describe('External Participant Controller Utils: ', () => {

  before(() => {
    config.pr = {
      client_id: "EU.EORI.NLHAPPYPETS"
    };
    config.ar = {
      url: "internal"
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validate_client_certificate', () => {

    const build_cert_mock = () => {
      return {
        subject: {
          attributes: [
            {shortName: "a", value: ""}
          ]
        },
        signatureOid: forge.pki.oids.sha256WithRSAEncryption,
        publicKey: {
          n: {
            bitLength: () => 2048,
          }
        },
        serialNumber: "ABC",
        getExtension: () => {return {digitalSignature: true}}
      };
    };

    describe('should not thrown exceptions for valid certificates', async () => {
      const cert = build_cert_mock();
      sinon.stub(utils, "verify_certificate_chain").returns(true);
      await utils.validate_client_certificate([cert]);
    });

    describe('should not validate certificates with errors', () => {
      const test = (label, changes, valid_chain=true) => {
        it(label, async () => {
          const cert = build_cert_mock();
          Object.assign(cert, changes);
          sinon.stub(utils, "verify_certificate_chain").returns(valid_chain);
          try {
            await utils.validate_client_certificate([cert]);
          } catch (error) {
            return;
          }
          throw Error("Exception not thrown");
        });
      };

      test(
        "invalid signature algorithm",
        {signatureOid: "a"}
      );
      test(
        "no serial number",
        {serialNumber: ""}
      );
      test(
        "Key usage is for CA",
        {
          getExtension: () => {return {
            digitalSignature: false,
            keyCertSign: true,
            cRLSign: false
          }}
        }
      );
      test(
        "Key usage is for signing CRLs",
        {
          getExtension: () => {return {
            digitalSignature: false,
            keyCertSign: false,
            cRLSign: true
          }}
        }
      );
      test(
        "certificate chain",
        {},
        false
      );
    });

    it('should validate certificates with special characters', async () => {
      sinon.stub(utils, "verify_certificate_chain").returns(true);
      await utils.validate_client_certificate([CERTIFICATE_WITH_SPECIAL_CHARACTERS]);
    });

  });

  describe('assert_client_using_jwt', () => {

    it('should throw an error if the client jwt is not correctly signed', async () => {
      const credentials = {};
      const client_id = "";

      sinon.stub(utils, "verifier");
      utils.verifier = {
        verify: sinon.mock().returns(Promise.reject())
      };
      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should throw an error if the client jwt payload is not a valid json structure', async () => {
      const credentials = {};
      const client_id = "";

      sinon.stub(utils, "verifier");
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          payload: "{"
        }))
      };
      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should throw an error if the client jwt issuer does not match the provided client_id', async () => {
      const credentials = {};
      const client_id = "EU.EORI.NL000000001";

      sinon.stub(utils, "verifier");
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          payload: '{"iss": "EU.EORI.NL000000004"}'
        }))
      };
      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should throw an error if the client jwt audience does not match keyrock id', async () => {
      const credentials = {};
      const client_id = "EU.EORI.NL000000004";

      sinon.stub(utils, "verifier");
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          payload: '{"iss": "EU.EORI.NL000000004", "aud": "EU.EORI.NL000000001"}'
        }))
      };
      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should throw an error if the client jwt has expired', async () => {
      const credentials = {};
      const client_id = "EU.EORI.NL000000004";

      sinon.stub(utils, "verifier");
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          // We use a exp value with a lot of margin (5000-01-10)
          payload: '{"iss": "EU.EORI.NL000000004", "aud": "EU.EORI.NLHAPPYPETS", "exp": 0}'
        }))
      };
      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should throw an error if the serial number of the certificate used for signing the jwt does not match client_id/issuer', async () => {
      const credentials = {};
      const client_id = "EU.EORI.NL000000004";

      sinon.stub(utils, "verifier");
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          header: {
            x5c: [1] // We mock parsing of certificates
          },
          // We use a exp value with a lot of margin (5000-01-10)
          payload: '{"iss": "EU.EORI.NL000000004", "aud": "EU.EORI.NLHAPPYPETS", "exp": 95618358000}'
        }))
      };

      sinon.stub(forge.pki, "certificateFromPem").returns({
        subject: {
          getField: sinon.mock().returns({
            value: "EU.EORI.NL000000001"
          })
        }
      });

      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should throw an error if the certificate used for signing the jwt is invalid', async () => {
      const credentials = {};
      const client_id = "EU.EORI.NL000000004";

      sinon.stub(utils, "verifier");
      sinon.stub(utils, "validate_client_certificate").throws();
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          header: {
            x5c: [1] // We mock parsing of certificates
          },
          // We use a exp value with a lot of margin (5000-01-10)
          payload: '{"iss": "EU.EORI.NL000000004", "aud": "EU.EORI.NLHAPPYPETS", "exp": 95618358000}'
        }))
      };

      sinon.stub(forge.pki, "certificateFromPem").returns({
        subject: {
          getField: sinon.mock().returns({
            value: "EU.EORI.NL000000004"
          })
        }
      });

      try {
        await utils.assert_client_using_jwt(credentials, client_id);
      } catch (error) {
        return;
      }
      throw Error("Exception not thrown");
    });

    it('should return jwt payload and the certificates if everything is ok', async () => {
      const credentials = {};
      const client_id = "EU.EORI.NL000000004";

      sinon.stub(utils, "verifier");
      sinon.stub(utils, "validate_client_certificate").returns();
      utils.verifier = {
        verify: sinon.mock().returns(Promise.resolve({
          header: {
            x5c: [1] // We mock parsing of certificates
          },
          // We use a exp value with a lot of margin (5000-01-10)
          payload: '{"iss": "EU.EORI.NL000000004", "aud": "EU.EORI.NLHAPPYPETS", "exp": 95618358000}'
        }))
      };

      sinon.stub(forge.pki, "certificateFromPem").returns({
        subject: {
          getField: sinon.mock().returns({
            value: "EU.EORI.NL000000004"
          })
        }
      });

      await utils.assert_client_using_jwt(credentials, client_id);
    });

  });

});
