// Copyright (c) 2017 Queensland Cyber Infrastructure Foundation (http://www.qcif.edu.au/)
//
// GNU GENERAL PUBLIC LICENSE
//    Version 2, June 1991
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

import { Observable } from 'rxjs/Rx';
import services = require('../core/CoreService.js');
import { Sails, Model } from "sails";
import 'rxjs/add/operator/toPromise';
import * as request from "request-promise";
import * as ejs from 'ejs';
import * as fs from 'graceful-fs';
import path = require('path');


import { Index, jsonld } from 'calcyte';
const datacrate = require('datacrate').catalog;

declare var sails: Sails;
declare var RecordsService;
declare var BrandingService;
declare var _;

// NOTE: the publication isn't being triggered if you go straight to review
// from a new data pub



export module Services {
  /**
   *
   * a Service to extract a DataPub and put it in a DataCrate with the
   * metadata crosswalked into the right JSON-LD
   *
   * @author <a target='_' href='https://github.com/spikelynch'>Mike Lynch</a>
   *
   */
  export class DataPublication extends services.Services.Core.Service {

  	protected _exportedMethods: any = [
  		'publishDataset'
  	];




  	public publishDataset(oid, record, options, user): Observable<any> {
   		if( this.metTriggerCondition(oid, record, options) === "true") {
     		sails.log.info(`Writing dataset for ${oid}, condition met: ${_.get(options, "triggerCondition", "")}`)

      	sails.log.info("oid: " + oid);
      	sails.log.info("workflow stage: " + record.workflow.stage)
      	sails.log.info("options: " + JSON.stringify(options));
      	sails.log.info("user: " + JSON.stringify(user));
				const site = sails.config.datapubs.sites[options['site']];
				if( ! site ) {
					sails.log.error("Unknown publication site " + options['site']);
					return Observable.of(null);
				}

				const md = record['metadata'];

				const drec = md['dataRecord'];
				const drid = drec ? drec['oid'] : undefined;

				if( ! drid ) {
					sails.log.error("Couldn't find dataRecord or id for data pub " + oid);
					sails.log.info(JSON.stringify(record));
					return Observable.of(null)
				}

				sails.log.info("Got data record: " + drid);

				const attachments = md['dataLocations'].filter(
					(a) => a['type'] === 'attachment'
				);


				// Creating the directory to publish. Currently done sync: should
				// be improved so that it's an Observable and conforms with 
				// OCFL

				const dir = path.join(site['dir'], oid);
				if( fs.existsSync(dir) ) {
					sails.log.debug("publication directory " + dir + " already exists");
				} else {
					try {
						sails.log.info("making dataset dir: " + dir);
						fs.mkdirSync(dir);
					} catch(e) {
						sails.log.error("Couldn't create dataset dir " + dir);
						sails.log.error(e.name);
						sails.log.error(e.message);
						sails.log.error(e.stack);
						return Observable.of(null);
					}
				}




				return Observable.from(attachments).flatMap((attachment) => {
					sails.log.debug("fetching attachment " + attachment['fileId']);
					return RecordsService.getDatastream(drid, attachment['fileId']).
						flatMap(ds => {
							const filename = path.join(dir, attachment['name']);
							sails.log.info("about to write attachment" + filename);
							return Observable.fromPromise(this.writeData(ds.body, filename))
								.catch(err => {
									sails.log.error("Error writing attachment " + attachment['fileId']);
									sails.log.error(err.name);
									sails.log.error(err.message);
                  return new Observable(null);
								});
						});
				}).flatMap((results) => { // because we only want this once
					sails.log.info("After attachments written, datacrate observable");
					return this.makeDataCrate(oid, dir, md, user)
				}).flatMap((r) => {
					// put the dataset URL into the record we're about to save
					// Note: the trailing slash on the URL is here to stop nginx auto-redirecting
					// it, which on localhost:8080 breaks the link in some browsers - see 
					// https://serverfault.com/questions/759762/how-to-stop-nginx-301-auto-redirect-when-trailing-slash-is-not-in-uri/812461#812461

					record['metadata']['citation_url'] = site['url'] + '/' + oid + '/';
					sails.log.info("Updating URL: " + record['metadata']['citation_url']);

					// TODO: check the results of the merged observables for writing out the
					// datastreams and log any errors back to the record

					return Observable.of(record);
				});

				// obs.push(this.makeDataCrate(oid, dir, md, user));

				// sails.log.info("Returning publication Observable");
				// return Observable.merge(...obs).flatMap((results) => {

				// })

    	} else {
     		sails.log.info(`Not writing dataset for ${oid}, condition not met: ${_.get(options, "triggerCondition", "")}`)
      	sails.log.info("workflow stage: " + record.workflow.stage)
    		return Observable.of(record);
   		}
  	}


		// this version works, but I'm worried that it will put the whole of
		// the buffer in RAM. See writeDatastream for my first attempt, which
		// doesnt' work.

		private writeData(buffer: Buffer, fn: string): Promise<boolean> {
			return new Promise<boolean>( ( resolve, reject ) => {
				try {
					fs.writeFile(fn, buffer, () => {
						sails.log.info("wrote to " + fn);
						resolve(true)
					});
				} catch(e) {
					sails.log.error("attachment write error");
					sails.log.error(e.name);
					sails.log.error(e.message);
					reject;
				}
			});
		}


		// This is the first attempt, but it doesn't work - the files it
		// writes out are always empty. I think it's because the API call
		// to get the attachment isn't requesting a stream, so it's coming
		// back as a buffer.

		private writeDatastream(stream: any, fn: string): Promise<boolean> {
			return new Promise<boolean>( (resolve, reject) => {
  			var wstream = fs.createWriteStream(fn);
  			sails.log.info("start writeDatastream " + fn);
  			stream.pipe(wstream);
  			stream.end();
				wstream.on('finish', () => {
					sails.log.info("finished writeDatastream " + fn);
					resolve(true);
				});
				wstream.on('error', (e) => {
					sails.log.error("File write error");
					reject
    		});
			});
		}

		// private updateUrl(oid: string, record: Object, baseUrl: string): Observable<any> {
		// 	const branding = sails.config.auth.defaultBrand; // fix me
		// 	// Note: the trailing slash on the URL is here to stop nginx auto-redirecting
		// 	// it, which on localhost:8080 breaks the link in some browsers - see 
		// 	// https://serverfault.com/questions/759762/how-to-stop-nginx-301-auto-redirect-when-trailing-slash-is-not-in-uri/812461#812461
		// 	record['metadata']['citation_url'] = baseUrl + '/' + oid + '/';
		// 	return RecordsService.updateMeta(branding, oid, record);
		// }


		private makeDataCrate(oid: string, dir: string, metadata: Object, user: Object): Observable< any > {

			sails.log.debug("makeDataCrate " + oid);
			const owner = user['email'];
			const approver = "fake.id@thing.edu.at";

			sails.log.info("User: " + JSON.stringify(user));

			sails.log.info("Set approver to: " + user['email']);



			// maybe have to add the get-owner to the front of this chain

			return Observable.of({})
				.flatMap(() => {
					return Observable.fromPromise(datacrate.datapub2catalog({
						'id': oid,
						'datapub': metadata,
						'organisation': sails.config.datapubs.datacrate.organization,
						'owner': owner,
						'approver': approver
					}))
				}).flatMap((catalog) => {
					// the following writes out the CATALOG.json and CATALOG.html, and it's all
					// sync because of legacy code in calcyte.
					try {
						const jsonld_h = new jsonld();
						const catalog_json = path.join(dir, sails.config.datapubs.datacrate.catalog_json);
						sails.log.info(`Building CATALOG.json with jsonld_h`);
						sails.log.silly(`catalog = ${JSON.stringify(catalog)}`);
						sails.log.info(`Writing CATALOG.json to ${catalog_json}`);
						fs.writeFileSync(catalog_json, JSON.stringify(catalog, null, 2));
						const index = new Index();
						index.init(catalog, dir, false);
						sails.log.info(`Writing CATALOG.html`);
						index.make_index_html("text_citation", "zip_path"); //writeFileSync
						return Observable.of(true);
					} catch (error) {
						sails.log.error("Error (inside) while creating DataCrate");
						sails.log.error(error.name);
						sails.log.error(error.message);
						sails.log.error(error.stack);
						return Observable.of(false);
					}
				}).catch(error => {
					sails.log.error("Error (outside) while creating DataCrate");
					sails.log.error(error.name);
					sails.log.error(error.message);
					sails.log.error(error.stack);
					return Observable.of(false);
				});
		}
	}
}

module.exports = new Services.DataPublication().exports();
