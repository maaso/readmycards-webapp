# ReadMyCards.eu
[![][t1t-logo]][Trust1Team-url]

ReadMyCards is a simple webapp that reads the contents of your smartcards using any capable reader.

[Website Trust1Team][Trust1Team-url]

## Changelog

### v1.1.2

* Fix card selection dialog not behaving correctly when multiple readers + cards are connected

### v1.1.1

* Fix for ERR_NETWORK_CHANGED error in Chrome
* Removed some unused scripts

## Requirements

* Node.js v6.9.2 LTS or higher

## Running Development build
Run npm install:
```ssh
$ npm install
```
Start the node.js process:
```ssh
$ npm start
```
If you have nodemon installed you can also run
```ssh
$ nodemon app.js
```
a nodemon.json configuration is present that will only trigger a nodemon restart when server files are changed.

Now that the server is running, you can also start a livereload server with grunt:
```ssh
$ grunt serve
```

*If you use both nodemon and livereload, all changes made to either server or client will trigger reloads and become available in your development environment.*

## Deployment
Clone the repository in your desired directory and switch to the correct release tag.

Now run the deployment script
```ssh
$ nmp run deploy
```
This script will pull in all dependencies and build a minfied/uglified/concatted distribution package in the /dist folder

Create a configuration YAML file called *config.yml* in the */config* directory. An example is provided. Make sure you change the environment to something other than *local*.

A full deployment guide can be found on [Confluence][rmc-confluence-deployment-guide]

## License

```
This file is part of the Trust1Team(R) sarl project.
 Copyright (c) 2014 Trust1Team sarl
 Authors: Trust1Team development

 
This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License version 3
 as published by the Free Software Foundation with the addition of the
 following permission added to Section 15 as permitted in Section 7(a):
 FOR ANY PART OF THE COVERED WORK IN WHICH THE COPYRIGHT IS OWNED BY Trust1T,
 Trust1T DISCLAIMS THE WARRANTY OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 or FITNESS FOR A PARTICULAR PURPOSE.
 See the GNU Affero General Public License for more details.
 You should have received a copy of the GNU Affero General Public License
 along with this program; if not, see http://www.gnu.org/licenses or write to
 the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 Boston, MA, 02110-1301 USA.

 The interactive user interfaces in modified source and object code versions
 of this program must display Appropriate Legal Notices, as required under
 Section 5 of the GNU Affero General Public License.

 
You can be released from the requirements of the Affero General Public License
 by purchasing
 a commercial license. Buying such a license is mandatory if you wish to develop commercial activities involving the Trust1T software without
 disclosing the source code of your own applications.
 Examples of such activities include: offering paid services to customers as an ASP,
 Signing PDFs on the fly in a web application, shipping OCS with a closed
 source product...
Irrespective of your choice of license, the T1T logo as depicted below may not be removed from this file, or from any software or other product or service to which it is applied, without the express prior written permission of Trust1Team sarl. The T1T logo is an EU Registered Trademark (n� 12943131).
```

[Trust1Team-url]: http://trust1team.com
[t1t-logo]: http://imgur.com/lukAaxx.png
[rmc-confluence-deployment-guide]: https://trust1t.atlassian.net/wiki/display/RMC/Deployment