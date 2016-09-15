# Trust1Connector DEMO page
[![][t1t-logo]][Trust1Team-url]

This is a demo web application to show the T1C (Trust1Connector) capabilities in a simple web application.

More information can be found on [Github][t1c-demo-doc]

[Website Trust1Team][Trust1Team-url]

## Summary

Only works from Kong 0.8.0

## Launch dev docker container
Pull container from docker hub:
```ssh
$ docker pull trust1team/t1c-webapp-demo
```
Launch container:
```ssh
$ docker run --name t1c-webapp-demo -p9000:80 -d trust1team/t1c-webapp-demo
```

## Development build

In order to run the demo, checkout the code and run
```ssh
$ nmp install
$ bower install
$ grunt serve
```

In order to deploy to the T1T demo page in the cloud, be sure to manually copy-paste the correct keycloak config in the keycloak.json file. 

## Create new development Docker container
1) build new image
```ssh
$ docker build -t t1c-webapp-demo .
```
2) Validate image - Launch docker dev environment (you have to expose port 9000 because authentication happens with predefined port)
```ssh
$ docker run --name t1c-webapp-demo -p9000:80 -d t1c-webapp-demo
```
3) get image ID in order to tag
```ssh
$ docker images
```
4) create tag
```ssh
$ docker tag cc5a5f646ae5 trust1team/t1c-webapp-demo:latest
```
5) login into docker hub (ask admin to add account to Trust1Team org)
```ssh
$ docker login
```
6) push the new tag
```ssh
$ docker push trust1team/t1c-webapp-demo:latest
```

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
[t1c-demo-doc]: https://github.com/Trust1Team/t1c-webapp-demo