import * as Yup from 'yup';
import ldapConfig from '../../config/ldap';
import fs from 'fs';
import Buffer from 'safer-buffer';
import bufferFrom from 'buffer-from';

var LdapClient = require('ldapjs-client');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var client = new LdapClient({ 
        url: ldapConfig.server,
        tlsOptions: { 
        ca: [
            fs.readFileSync('src/config/certificates/certificate.p7b')
            ]
        }
    });

/*
    index() // Listagem
    show() // Listagem de único registro
    store() // Cadastro
    update() // Atualização
    delete() // Remoção
*/

class ActiveDirectoryController {
  
    async store(req, res) {
        
    }

    async show(req, res){
        var users = [];
        const { cpf } = req.params;
        try {            
            await client.bind(ldapConfig.userPrincipalName, ldapConfig.password);
            const options = {
              filter: `(&(postOfficeBox=${cpf})(objectClass=user))`,
              scope: 'sub'
            };          
            await client.search(ldapConfig.adSuffix, options).then(function(response) {
                if(response.length > 0){
                    for(let i =0;i < response.length;i++){
                        const { dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox } = response[i]; 
                        users.push({dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox});
                    }
                }
            });
        } catch (e) {
            console.log('[ActiveDirectoryController - show]: ', e.toString());
        } finally {
            return res.status(200).json(users);
        }
    }

    async index(req, res){        
        var users = [];
        const { cpf } = req.params;
        try {            
            await client.bind(ldapConfig.userPrincipalName, ldapConfig.password);
            const options = {
              filter: `(objectClass=person)`,
              scope: 'sub'
            };          
            await client.search(ldapConfig.adSuffix, options).then(function(response) {
                if(response.length > 0){
                    for(let i =0;i < response.length;i++){
                        const { dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox } = response[i]; 
                        users.push({dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox});
                    }
                }
            });
        } catch (e) {
            console.log('[ActiveDirectoryController - show]: ', e.toString());
        } finally {
            return res.status(200).json(users);
        }
    }

    async update(req, res){
        var results = [];
        try {            

            await client.bind(ldapConfig.userPrincipalName, ldapConfig.password);            

            const { cn, options, type } = req.body;
     
            if(type === "modify"){

                const changeOptions = options;    
                await client.modify(`CN=${cn}, ${ldapConfig.adSuffix}`, changeOptions).then(function(response){                    
                    results.push(response);
                }).catch(function(error){
                    results.push({error: error});
                });

            }else if(type === "modifyDN"){

                const changeOptions = options[0].cn;    
                await client.modifyDN(`${cn}`, `${changeOptions}`).then(function(response){                    
                    results.push(response);
                }).catch(function(error){
                    results.push({error: error});
                });

            }else if(type === "resetPassword"){

                const password = options[0].password;
                const newPassword = new bufferFrom(`"${password}"`, 'utf16le').toString();
                const changeOptions = {
                    operation: 'replace', 
                    modification: {
                        unicodePwd: newPassword
                    }
                };

                await client.modify(`CN=${cn}, ${ldapConfig.adSuffix}`, changeOptions).then(function(response){                    
                    results.push(response);
                }).catch(function(error){
                    console.log(error);
                });

            }


        } catch (e) {
            console.log('[ActiveDirectoryController - update]: ', e.toString());
        } finally {
            return res.status(200).json(results);
        }
    }



}

export default new ActiveDirectoryController();
