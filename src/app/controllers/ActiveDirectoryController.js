import * as Yup from 'yup';
import ldap from 'ldapjs';
import ssha from 'node-ssha256';
import assert from 'assert';

import ldapConfig from '../../config/ldap';

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
        if(cpf.length !== 11){
          return res.status(400).json({error: 'CPF size must be 11 characters'});
        }

        const client = ldap.createClient({
            url: `${ldapConfig.server}`
        });   
        
        client.bind(ldapConfig.userPrincipalName,ldapConfig.password, err => {
            assert.ifError(err);
        });

        const searchOptions =  {
                "scope": "sub",
               // "filter": `(|(postOfficeBox=${cpf})(cn=${cpf}))`
                "filter": `(postOfficeBox=${cpf})`
        };

        client.search(ldapConfig.adSuffix,searchOptions,(err, response) => {
            
            response.on('searchEntry', entry => {
                const { dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox } = entry.object;
                users.push({
                    dn,
                    cn,
                    distinguishedName,
                    name,
                    sAMAccountName,
                    objectCategory,
                    postOfficeBox
                });
            });

            response.on('end', result => {
                res.status(200).json(users);
                console.log(users);
            });

        });

        client.unbind( err => {
            assert.ifError(err);
        });   

    }


    async index(req, res){

        var users = [];

        const client = ldap.createClient({
            url: `${ldapConfig.server}`
        });   

        client.bind(ldapConfig.userPrincipalName,ldapConfig.password, err => {
            assert.ifError(err);
        });

        
        const searchOptions =  {
            "scope": "sub"
        };

        client.search(ldapConfig.adSuffix,searchOptions,(err, response) => {
            response.on('searchEntry', entry => {
                const { dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox } = entry.object;
                users.push({
                    dn,
                    cn,
                    distinguishedName,
                    name,
                    sAMAccountName,
                    objectCategory,
                    postOfficeBox
                });
            });
            response.on('end', result => {
                res.status(200).json(users);
                console.log(users);
            });
        });
        client.unbind( err => {
            assert.ifError(err);
        });   
         
    }


}

export default new ActiveDirectoryController();
