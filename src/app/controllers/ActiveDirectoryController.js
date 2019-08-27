import * as Yup from 'yup';

var LdapClient = require('ldapjs-client');
import ldapConfig from '../../config/ldap';

var client = new LdapClient({ url: ldapConfig.server });


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
              filter: `(postOfficeBox=${cpf})`,
              scope: 'sub'
            };          
            const entries = await client.search(ldapConfig.adSuffix, options).then(function(entries){
               
                const { dn, cn, distinguishedName, name, sAMAccountName, objectCategory, postOfficeBox } = entries;
           
                users.push({
                    dn,
                    cn,
                    distinguishedName,
                    name,
                    sAMAccountName,
                    objectCategory,
                    postOfficeBox
                });
    
                return res.status(200).json({
                    users  
                });
            });          
           

        } catch (e) {
            console.log('[ERROR ON SEARCH] > ', e.toString());
        }finally{
            
        }

    }

    async index(req, res){        
        return res.status(200).json({ok:true});    
    }

    async update(req, res){
        return res.status(200).json({ok:true}); 
    }



}

export default new ActiveDirectoryController();
