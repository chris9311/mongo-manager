module.exports = {

    /*
     *Setting a mongoDB to save the server data.Such as the database list and the users' data;
     */
    serverDatabase: {
        dbUrl : '10.222.49.54:27017'
    },

    /*
     * Setting the databases which you want to check it;
     */
    mongodb: {
        //the default connection and you will connect this db when you visit the website;
        default : '10.222.47.247:12345',
        //the databases list,you can push the connection in the array;
        addressList : ['10.222.47.247:12345','127.0.0.1:27017','10.222.49.56:27017']
    }
};
