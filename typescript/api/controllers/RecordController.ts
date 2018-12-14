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

//<reference path='./../../typings/loader.d.ts'/>
declare var module;
declare var sails;
import { Observable } from 'rxjs/Rx';
import moment from 'moment-es6';
import * as tus from 'tus-node-server';
import * as fs from 'fs';
declare var _;

declare var FormsService, RecordsService, WorkflowStepsService, BrandingService, RecordTypesService, TranslationService, User, EmailService, RolesService;
/**
 * Package that contains all Controllers.
 */
import controller = require('../core/CoreController.js');
export module Controllers {
  /**
   * Responsible for all things related to a Record, includings Forms, etc.
   *
   * Author: <a href='https://github.com/shilob' target='_blank'>Shilo Banihit</a>
   */
  export class Record extends controller.Controllers.Core.Controller {

    /**
     * Exported methods, accessible from internet.
     */
    protected _exportedMethods: any = [
      'edit',
      'getForm',
      'create',
      'update',
      'stepTo',
      // 'modifyEditors',
      'search',
      'getType',
      'getWorkflowSteps',
      'getMeta',
      'getTransferResponsibilityConfig',
      'updateResponsibilities',
      'doAttachment',
      'getAttachments',
      'getDataStream',
      'getAllTypes',
      'delete'
    ];

    /**
     **************************************************************************************************
     **************************************** Add custom methods **************************************
     **************************************************************************************************
     */

    public bootstrap() {
    }

    public getMeta(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const oid = req.param('oid') ? req.param('oid') : '';
      var obs = RecordsService.getMeta(oid);
      return obs.subscribe(record => {
        this.hasViewAccess(brand, req.user, record).subscribe(hasViewAccess => {
          if (hasViewAccess) {
            return res.json(record.metadata);
          } else {
            return res.json({ status: "Access Denied" });
          }

        });
      });
    }

    public edit(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const oid = req.param('oid') ? req.param('oid') : '';
      const recordType = req.param('recordType') ? req.param('recordType') : '';
      const rdmp = req.query.rdmp ? req.query.rdmp : '';
      let appSelector = 'dmp-form';
      let appName = 'dmp';
      sails.log.debug('RECORD::APP: ' + appName)
      if (recordType != '') {
        FormsService.getForm(brand.id, recordType, true, true).subscribe(form => {
          if (form['customAngularApp'] != null) {
            appSelector = form['customAngularApp']['appSelector'];
            appName = form['customAngularApp']['appName'];
          }
          return this.sendView(req, res, 'record/edit', { oid: oid, rdmp: rdmp, recordType: recordType, appSelector: appSelector, appName: appName });
        });
      } else {
        RecordsService.getMeta(oid).flatMap(record => {
          const formName = record.metaMetadata.form;
          return FormsService.getFormByName(formName, true);
        }).subscribe(form => {
          sails.log.debug(form);
          if (form['customAngularApp'] != null) {
            appSelector = form['customAngularApp']['appSelector'];
            appName = form['customAngularApp']['appName'];
          }
          return this.sendView(req, res, 'record/edit', { oid: oid, rdmp: rdmp, recordType: recordType, appSelector: appSelector, appName: appName });
        }, error => {
          return this.sendView(req, res, 'record/edit', { oid: oid, rdmp: rdmp, recordType: recordType, appSelector: appSelector, appName: appName });
        });

      }
    }

    protected hasEditAccess(brand, user, currentRec) {
      sails.log.verbose("Current Record: ");
      sails.log.verbose(currentRec);
      return Observable.of(RecordsService.hasEditAccess(brand, user, user.roles, currentRec));
    }

    protected hasViewAccess(brand, user, currentRec) {
      sails.log.verbose("Current Record: ");
      sails.log.verbose(currentRec);
      return Observable.of(RecordsService.hasViewAccess(brand, user, user.roles, currentRec));
    }

    public getTransferResponsibilityConfig(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      var type = req.param('type');
      var recordTypeConfig = sails.config.recordtype;
      return this.getTransferResponsibilityConfigObject(brand, type).subscribe(transferObject => {
        return res.json(transferObject);
      });
    }



    private getTransferResponsibilityConfigObject(brand, recordType) {
      return RecordTypesService.get(brand, recordType).map(recordType => {

        return recordType["transferResponsibility"];
      });
    }

    protected updateResponsibility(transferConfig, role, record, updateData) {
      const respConfig = transferConfig.fields[role];
      if (respConfig.updateField) {
        // overwrite the whole field instead of 'merging'...
        _.set(record, `metadata.${respConfig.updateField}`, updateData);
        // 'merge' code commented out:
        // _.forOwn(updateData, (val, key) => {
        //   _.set(record, `metadata.${respConfig.updateField}.${key}`, val);
        // });
      }
      if (respConfig.fieldNames) {
        _.forOwn(respConfig.fieldNames, (val, key) => {
          _.set(record, `metadata.${val}`, _.get(updateData, key));
        });
      }
      if (respConfig.updateAlso) {
        _.each(respConfig.updateAlso, (relatedRole) => {
          record = this.updateResponsibility(transferConfig, relatedRole, record, updateData);
        });
      }
      return record;
    }

    public updateResponsibilities(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const user = req.user;
      const records = req.body.records;
      const updateData = req.body.updateData;
      var role = req.body.role;
      var toEmail = updateData.email;
      var toName = updateData.text_full_name;
      let recordCtr = 0;
      if (records.length > 0) {
        let completeRecordSet = [];
        let hasError = false;
        _.forEach(records, rec => {
          // First: check if this user has edit access to this record, we don't want Gremlins sneaking in on us
          // Not trusting what was posted, retrieving from DB...
          this.getRecord(rec.oid).subscribe(recObj => {
            if (RecordsService.hasEditAccess(brand, user, user.roles, recObj)) {
              let recType = rec.metadata.metaMetadata.type;
              let relatedRecords = RecordsService.getRelatedRecords(rec.oid, brand);

              relatedRecords.then(relatedRecords => {

                let relationships = relatedRecords['processedRelationships'];

                let relatedObjects = relatedRecords['relatedObjects'];

                //If there are no relationships, the record isn't related to any others so manually inject the info needed to have this record processed
                if (relationships.indexOf(recType) == -1) {
                  relationships.push(recType);
                  relatedObjects[recType] = [{ redboxOid: rec.oid }];
                }
                let relationshipCount = 0;
                _.each(relationships, relationship => {
                  let relationshipObjects = relatedObjects[relationship];
                  relationshipCount++;
                  let relationshipObjectCount = 0;
                  _.each(relationshipObjects, relationshipObject => {

                    const oid = relationshipObject.redboxOid;
                    let record = null;
                    this.getRecord(oid)
                      .flatMap((rec) => {
                        record = rec;
                        return RecordTypesService.get(brand, record.metaMetadata.type);
                      })
                      .subscribe(recordTypeObj => {

                        const transferConfig = recordTypeObj['transferResponsibility'];
                        if (transferConfig) {
                          record = this.updateResponsibility(transferConfig, role, record, updateData);

                          sails.log.verbose(`Updating record ${oid}`);
                          sails.log.verbose(JSON.stringify(record));
                          RecordsService.updateMeta(brand, oid, record).subscribe(response => {
                            relationshipObjectCount++;
                            if (response && response.code == "200") {
                              if (oid == rec.oid) {
                                recordCtr++;
                              }
                              var to = toEmail;
                              var subject = "Ownership transfered";
                              var data = {};
                              data['record'] = record;
                              data['name'] = toName;
                              data['oid'] = oid;
                              EmailService.sendTemplate(to, subject, "transferOwnerTo", data);



                              if (relationshipCount == relationships.length && relationshipObjectCount == relationshipObjects.length) {
                                completeRecordSet.push({ success: true, record: record });
                                if (completeRecordSet.length == records.length) {
                                  if (hasError) {
                                    return this.ajaxFail(req, res, null, completeRecordSet);
                                  } else {
                                    return this.ajaxOk(req, res, null, completeRecordSet);
                                  }
                                } else {
                                  sails.log.verbose(`Completed record set:`);
                                  sails.log.verbose(`${completeRecordSet.length} == ${records.length}`);
                                }
                              } else {
                                sails.log.verbose(`Record counter:`);
                                sails.log.verbose(`${recordCtr} == ${records.length} && ${relationshipCount} == ${relationships.length} && ${relationshipObjectCount} == ${relationshipObjects.length}`);
                              }
                            } else {
                              sails.log.error(`Failed to update authorization:`);
                              sails.log.error(response);
                              hasError = true;
                              completeRecordSet.push({ success: false, error: response, record: record });
                              if (completeRecordSet.length == records.length) {
                                if (hasError) {
                                  return this.ajaxFail(req, res, null, completeRecordSet);
                                } else {
                                  return this.ajaxOk(req, res, null, completeRecordSet);
                                }
                              }
                            }
                          }, error => {
                            sails.log.error("Error updating auth:");
                            sails.log.error(error);
                            hasError = true;
                            completeRecordSet.push({ success: false, error: error.message, record: record });
                            if (completeRecordSet.length == records.length) {
                              if (hasError) {
                                return this.ajaxFail(req, res, null, completeRecordSet);
                              } else {
                                return this.ajaxOk(req, res, null, completeRecordSet);
                              }
                            }
                          });

                        }
                      });
                  });

                })
              });
            } else {
              const errorMsg = `Attempted to transfer responsibilities, but user: '${user.username}' has no access to record: ${rec.oid}`;
              sails.log.error(errorMsg);
              completeRecordSet.push({ success: false, error: errorMsg, record: rec });
              // send response in case failures occur in the last entry of the array
              if (completeRecordSet.length == records.length) {
                if (hasError) {
                  return this.ajaxFail(req, res, null, completeRecordSet);
                } else {
                  return this.ajaxOk(req, res, null, completeRecordSet);
                }
              }
            }
          });
        });
      } else {
        return this.ajaxFail(req, res, 'No records specified');
      }
    }


    public getForm(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const name = req.param('name');
      const oid = req.param('oid');
      const editMode = req.query.edit == "true";

      let obs = null;
      if (_.isEmpty(oid)) {
        obs = FormsService.getForm(brand.id, name, editMode, true).flatMap(form => {
          let mergedForm = this.mergeFields(req, res, form.fields, name, {}).then(fields => {
            form.fields = fields;
            return form;
          });
          return mergedForm;
        });
      } else {
        // defaults to retrive the form of the current workflow state...
        obs = RecordsService.getMeta(oid).flatMap(currentRec => {
          if (_.isEmpty(currentRec)) {
            return Observable.throw(new Error(`Error, empty metadata for OID: ${oid}`));
          }
          if (editMode) {
            return this.hasEditAccess(brand, req.user, currentRec)
              .flatMap(hasEditAccess => {
                if (!hasEditAccess) {
                  return Observable.throw(new Error(TranslationService.t('edit-error-no-permissions')));
                }
                const formName = currentRec.metaMetadata.form;
                return FormsService.getFormByName(formName, editMode).flatMap(form => {
                  if (_.isEmpty(form)) {
                    return Observable.throw(new Error(`Error, getting form ${formName} for OID: ${oid}`));
                  }
                  let mergedForm = this.mergeFields(req, res, form.fields, currentRec.metaMetadata.type, currentRec.metadata).then(fields => {
                    form.fields = fields;

                    return form;
                  });
                  return mergedForm;
                });
              });
          } else {
            return this.hasViewAccess(brand, req.user, currentRec)
              .flatMap(hasViewAccess => {
                if (!hasViewAccess) {
                  return Observable.throw(new Error(TranslationService.t('view-error-no-permissions')));
                }
                const formName = currentRec.metaMetadata.form;
                return FormsService.getFormByName(formName, editMode).flatMap(form => {
                  if (_.isEmpty(form)) {
                    return Observable.throw(new Error(`Error, getting form ${formName} for OID: ${oid}`));
                  }
                  return this.mergeFields(req, res, form.fields, currentRec.metaMetadata.type, currentRec.metadata).then(fields => {
                    form.fields = fields;

                    return form;
                  });
                });
              });
          }
        });
      }
      obs.subscribe(form => {
        if (!_.isEmpty(form)) {
          this.ajaxOk(req, res, null, form);
        } else {
          this.ajaxFail(req, res, null, { message: `Failed to get form with name:${name}` });
        }
      }, error => {
        sails.log.error("Error getting form definition:");
        sails.log.error(error);
        let message = error.message;
        if (error.error && error.error.code == 500) {
          message = TranslationService.t('missing-record');
        }
        this.ajaxFail(req, res, message);
      });

    }

    public create(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const metadata = req.body;
      let record: any = { metaMetadata: {} };
      var recType = req.param('recordType');
      const targetStep = req.param('targetStep');
      record.authorization = { view: [req.user.username], edit: [req.user.username] };
      record.metaMetadata.brandId = brand.id;
      record.metaMetadata.createdBy = req.user.username;
      //TODO: This is currently hardcoded
      record.metaMetadata.type = recType;
      record.metadata = metadata;

      RecordTypesService.get(brand, recType).subscribe(recordType => {
        let wfStepObs = WorkflowStepsService.getFirst(recordType);
        if (targetStep) {
          wfStepObs = WorkflowStepsService.get(recType, targetStep);
        }
        wfStepObs.subscribe(wfStep => {
          RecordsService.updateWorkflowStep(record, wfStep);
          return this.createRecord(record, brand, recordType, req, res);
        }, error => {
          this.ajaxFail(req, res, `Failed to save record: ${error}`);
        });
      });
    }

    private createRecord(record, brand, recordType, req, res) {
      const user = req.user;

      RecordsService.create(brand, record, recordType, user).subscribe(response => {
        if (response && response.code == "200") {
          response.success = true;
          this.ajaxOk(req, res, null, response);
        } else {
          this.ajaxFail(req, res, null, response);
        }
      }, error => {
        return Observable.throw(`Failed to save record: ${error}`)
      });
    }


    public delete(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const oid = req.param('oid');
      const user = req.user;
      let currentRec = null;
      let message = null;
      this.getRecord(oid).flatMap(cr => {
        currentRec = cr;
        return this.hasEditAccess(brand, user, currentRec);
      })
        .flatMap(hasEditAccess => {
          if (hasEditAccess) {
            return RecordsService.delete(oid);
          }
          message = TranslationService.t('edit-error-no-permissions');
          return Observable.throw(new Error(TranslationService.t('edit-error-no-permissions')));
        })
        .subscribe(response => {
          if (response && response.code == "200") {
            const resp = { success: true, oid: oid };
            sails.log.verbose(`Successfully deleted: ${oid}`);
            this.ajaxOk(req, res, null, resp);
          } else {
            this.ajaxFail(req, res, TranslationService.t('failed-delete'), { success: false, oid: oid, message: response.message });
          }
        }, error => {
          sails.log.error("Error deleting:");
          sails.log.error(error);
          if (message == null) {
            message = error.message;
          } else
            if (error.error && error.error.code == 500) {
              message = TranslationService.t('missing-record');
            }
          this.ajaxFail(req, res, message);
        });
    }

    public update(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const metadata = req.body;
      const oid = req.param('oid');
      const targetStep = req.param('targetStep');
      const user = req.user;
      let currentRec = null;
      let origRecord = null;
      const failedAttachments = [];
      let recType = null;
      this.getRecord(oid).flatMap(cr => {
        currentRec = cr;
        return this.hasEditAccess(brand, user, currentRec);
      })
        .flatMap(hasEditAccess => {
          return RecordTypesService.get(brand, currentRec.metaMetadata.type)
        }).flatMap(recordType => {
          recType = recordType;
          if (targetStep) {
            return WorkflowStepsService.get(recType, targetStep);
          } else {
            return Observable.of(null);
          }
        }).flatMap(nextStep => {
          if (metadata.delete) {
            return Observable.of(currentRec);
          }
          let hasPermissionToTransition = true;
          if (nextStep != undefined) {
            if (nextStep.config != undefined) {
              if (nextStep.config.authorization.transitionRoles != undefined) {
                if (nextStep.config.authorization.transitionRoles.length > 0) {
                  let validRoles = _.filter(nextStep.config.authorization.transitionRoles, role => {
                    let val = _.find(user.roles, userRole => {
                      return role == userRole;
                    });
                    if (val != undefined) {
                      return true;
                    }
                    return false;
                  });
                  if (validRoles.length == 0) {
                    hasPermissionToTransition = false;
                  }
                }
              }
            }
          }
          if (hasPermissionToTransition) {
            RecordsService.updateWorkflowStep(currentRec, nextStep);
          }
          origRecord = _.cloneDeep(currentRec);
          currentRec.metadata = metadata;

          return Observable.of(currentRec);

        }).subscribe(record => {
          if (metadata.delete) {
            RecordsService.delete(oid).subscribe(response => {
              if (response && response.code == "200") {
                response.success = true;
                sails.log.verbose(`Successfully deleted: ${oid}`);
                this.ajaxOk(req, res, null, response);
              } else {
                this.ajaxFail(req, res, TranslationService.t('failed-delete'), response);
              }
            }, error => {
              sails.log.error(`Error deleting: ${oid}`);
              sails.log.error(error);
              this.ajaxFail(req, res, error.message);
            });
            return;
          }

          if (record.metadata) {
            record = Observable.of(record);
          }
          record.subscribe(currentRec => {


            return FormsService.getFormByName(currentRec.metaMetadata.form, true)
              .flatMap(form => {
                currentRec.metaMetadata.attachmentFields = form.attachmentFields;
                return this.updateMetadata(brand, oid, currentRec, user);
              })
              .subscribe(response => {
                if (response && response.code == "200") {
                  return this.updateDataStream(oid, origRecord, metadata, response, req, res);
                } else {
                  this.ajaxFail(req, res, null, response);
                }
              }, error => {
                sails.log.error("Error updating meta:");
                sails.log.error(error);
                this.ajaxFail(req, res, error.message);
              });
          });
        });

    }




    /**
     * Handles data stream updates, atm, this call is terminal.
     */
    protected updateDataStream(oid, origRecord, metadata, response, req, res) {
      const fileIdsAdded = [];
      RecordsService.updateDatastream(oid, origRecord, metadata, sails.config.record.attachments.stageDir, fileIdsAdded)
        .concatMap(reqs => {
          if (reqs) {
            sails.log.verbose(`Updating data streams...`);
            return Observable.from(reqs);
          } else {
            sails.log.verbose(`No datastreams to update...`);
            return Observable.of(null);
          }
        })
        .concatMap((promise) => {
          if (promise) {
            sails.log.verbose(`Update datastream request is...`);
            sails.log.verbose(JSON.stringify(promise));
            return promise.catch(e => {
              sails.log.verbose(`Error in updating stream::::`);
              sails.log.verbose(JSON.stringify(e));
              return Observable.of(e);
            });
          } else {
            return Observable.of(null);
          }
        })
        .concatMap(updateResp => {
          if (updateResp) {
            sails.log.verbose(`Got response from update datastream request...`);
            sails.log.verbose(JSON.stringify(updateResp));
          }
          return Observable.of(updateResp);
        })
        .last()
        .subscribe(whatever => {
          sails.log.verbose(`Done with updating streams and returning response...`);
          response.success = true;
          this.ajaxOk(req, res, null, response);
        }, error => {
          sails.log.error("Error updating datatreams:");
          sails.log.error(error);
          this.ajaxFail(req, res, error.message);
        });
    }

    protected saveMetadata(brand, oid, currentRec, metadata, user): Observable<any> {
      currentRec.metadata = metadata;
      return this.updateMetadata(brand, oid, currentRec, user);
    }

    protected saveAuthorization(brand, oid, currentRec, authorization, user): Observable<any> {
      return this.hasEditAccess(brand, user, currentRec)
        .flatMap(hasEditAccess => {
          if (hasEditAccess) {
            currentRec.authorization = authorization;
            return this.updateAuthorization(brand, oid, currentRec, user);
          } else {
            return { code: 403, message: "Not authorized to edit" };
          }
        });
    }



    protected getRecord(oid) {
      return RecordsService.getMeta(oid).flatMap(currentRec => {
        if (_.isEmpty(currentRec)) {
          return Observable.throw(new Error(`Failed to update meta, cannot find existing record with oid: ${oid}`));
        }
        return Observable.of(currentRec);
      });
    }

    protected updateMetadata(brand, oid, currentRec, user) {
      if (currentRec.metaMetadata.brandId != brand.id) {
        return Observable.throw(new Error(`Failed to update meta, brand's don't match: ${currentRec.metaMetadata.brandId} != ${brand.id}, with oid: ${oid}`));
      }
      currentRec.metaMetadata.lastSavedBy = user.username;
      currentRec.metaMetadata.lastSaveDate = moment().format();
      sails.log.verbose(`Calling record service...`);
      sails.log.verbose(currentRec);
      return RecordsService.updateMeta(brand, oid, currentRec, user);
    }

    protected updateAuthorization(brand, oid, currentRec, user) {
      if (currentRec.metaMetadata.brandId != brand.id) {
        return Observable.throw(new Error(`Failed to update meta, brand's don't match: ${currentRec.metaMetadata.brandId} != ${brand.id}, with oid: ${oid}`));
      }
      return RecordsService.updateMeta(brand, oid, currentRec, user);
    }

    public stepTo(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const metadata = req.body;
      const oid = req.param('oid');
      const targetStep = req.param('targetStep');
      let origRecord = null;
      return this.getRecord(oid).flatMap(currentRec => {
        origRecord = _.cloneDeep(currentRec);
        return this.hasEditAccess(brand, req.user, currentRec)
          .flatMap(hasEditAccess => {
            if (!hasEditAccess) {
              return Observable.throw(new Error(TranslationService.t('edit-error-no-permissions')));
            }
            return RecordTypesService.get(brand, origRecord.metaMetadata.type);
          })
          .flatMap(recType => {
            return WorkflowStepsService.get(recType, targetStep)
              .flatMap(nextStep => {
                currentRec.metadata = metadata;
                sails.log.verbose("Current rec:");
                sails.log.verbose(currentRec);
                sails.log.verbose("Next step:");
                sails.log.verbose(nextStep);
                RecordsService.updateWorkflowStep(currentRec, nextStep);
                return this.updateMetadata(brand, oid, currentRec, req.user);
              });
          })
      })
        .subscribe(response => {
          return response.subscribe(response => {
            sails.log.error(response);
            if (response && response.code == "200") {
              response.success = true;
              this.ajaxOk(req, res, null, response);
            } else {
              this.ajaxFail(req, res, null, response);
            }
          }, error => {
            sails.log.error("Error updating meta:");
            sails.log.error(error);
            this.ajaxFail(req, res, error.message);
          });
        });
    }

    protected async mergeFields(req, res, fields, type, metadata) {

      let recordType = await RecordTypesService.get(BrandingService.getBrand(req.session.branding), type).toPromise();
      let workflowSteps = await WorkflowStepsService.getAllForRecordType(recordType).toPromise();
      this.mergeFieldsSync(req, res, fields, metadata, workflowSteps);
      return fields;
    }

    protected mergeFieldsSync(req, res, fields, metadata, workflowSteps) {
      const fieldsToDelete = [];
      _.forEach(fields, field => {
        if (_.has(metadata, field.definition.name)) {
          field.definition.value = metadata[field.definition.name];
        }
        this.replaceCustomFields(req, res, field, metadata);
        const val = field.definition.value;
        if (field.roles) {
          let hasAccess = false;
          _.each(field.roles, (r) => {
            hasAccess = RolesService.getRoleWithName(req.user.roles, r);
            if (hasAccess) return false;
          });
          if (!hasAccess) {
            fieldsToDelete.push(field);
          }
        }

        if (field.class == "SaveButton") {
          if (field.definition.targetStep) {
            let workflowStep = _.filter(workflowSteps, workflowStep => {
              return workflowStep.name == field.definition.targetStep;
            });
            if (workflowStep.length > 0) {
              workflowStep = workflowStep[0];
              if (workflowStep.config.authorization.transitionRoles) {
                let hasAccess = false;
                _.each(workflowStep.config.authorization.transitionRoles, (r) => {
                  hasAccess = RolesService.getRoleWithName(req.user.roles, r);
                  if (hasAccess) return false;
                });
                if (!hasAccess) {
                  fieldsToDelete.push(field);
                }
              }
            } else {
              sails.log.warn("Form configuration contains a target step that doesn't exist for record");
            }
          }
        }
        if (field.definition.fields && _.isObject(val) && !_.isString(val) && !_.isUndefined(val) && !_.isNull(val) && !_.isEmpty(val)) {
          _.each(field.definition.fields, fld => {
            fld.definition.value = _.get(metadata, `${field.definition.name}.${fld.definition.name}`);
          });
        } else
          if (field.definition.fields) {
            this.mergeFieldsSync(req, res, field.definition.fields, metadata, workflowSteps);
          }
      });
      _.remove(fields, (f) => { return _.includes(fieldsToDelete, f); });
    }

    protected replaceCustomFields(req, res, field, metadata) {
      let variableSubstitutionFields = field.variableSubstitutionFields;
      if (!_.isEmpty(variableSubstitutionFields)) {
        _.forEach(variableSubstitutionFields, fieldName => {
          _.forOwn(sails.config.record.customFields, (customConfig, customKey) => {
            const fieldTarget = _.get(field.definition, fieldName);
            if (!_.isEmpty(fieldTarget) && _.isString(fieldTarget) && fieldTarget.indexOf(customKey) != -1) {
              let replacement = null;
              if (customConfig.source == 'request') {
                switch (customConfig.type) {
                  case 'session':
                    replacement = req.session[customConfig.field];
                    break;
                  case 'param':
                    replacement = req.param(customConfig.field);
                    break;
                  case 'user':
                    replacement = req.user[customConfig.field];
                    break;
                }
              }

              if (!_.isEmpty(replacement)) {
                _.set(field.definition, fieldName, fieldTarget.replace(customKey, replacement));
              }
            }
          });
        });
      }
    }

    /**
    *  Not currently used as transfer responsibility is configured.
    *  Commenting out so we can reinstate it when more formal "edit permission"
    *    screens are implemented.
    */
    // public modifyEditors(req, res) {
    //   const records = req.body.records;
    //   var toUsername = req.body.username;
    //   var toEmail = req.body.email;
    //   //TODO: Add email to username lookup
    //   const fromUsername = req.user.username;
    //   const brand = BrandingService.getBrand(req.session.branding);
    //   const user = req.user;
    //
    //   let recordCtr = 0;
    //   if (records.length > 0) {
    //     _.forEach(records, rec => {
    //       const oid = rec.oid;
    //       this.getRecord(oid).subscribe(record => {
    //         const authorization = _.cloneDeep(record.authorization);
    //         // current user will lose edit access but will keep read-only access
    //         _.remove(authorization.edit, (username) => {
    //           return username == fromUsername;
    //         });
    //         if (_.isUndefined(_.find(authorization.view, (username) => { return username == fromUsername }))) {
    //           authorization.view.push(fromUsername);
    //         }
    //         if (!_.isEmpty(toUsername)) {
    //           if (_.isUndefined(_.find(authorization.edit, (username) => { return username == toUsername }))) {
    //             authorization.edit.push(toUsername);
    //           }
    //         } else {
    //           if (_.isUndefined(_.find(authorization.editPending, (email) => { return toEmail == email }))) {
    //             if (_.isUndefined(authorization.editPending)) {
    //               authorization.editPending = [];
    //             }
    //             authorization.editPending.push(toEmail);
    //           }
    //         }
    //
    //         this.saveAuthorization(brand, oid, record, authorization, user).subscribe(response => {
    //           if (response && response.code == "200") {
    //             recordCtr++;
    //             if (recordCtr == records.length) {
    //               response.success = true;
    //               this.ajaxOk(req, res, null, response);
    //             }
    //           } else {
    //             sails.log.error(`Failed to update authorization:`);
    //             sails.log.error(response);
    //             this.ajaxFail(req, res, TranslationService.t('auth-update-error'));
    //           }
    //         }, error => {
    //           sails.log.error("Error updating auth:");
    //           sails.log.error(error);
    //           this.ajaxFail(req, res, error.message);
    //         });
    //       });
    //     });
    //   } else {
    //     this.ajaxFail(req, res, 'No records specified');
    //   }
    // }

    public search(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const type = req.param('type');
      const workflow = req.query.workflow;
      const searchString = req.query.searchStr;
      const exactSearchNames = _.isEmpty(req.query.exactNames) ? [] : req.query.exactNames.split(',');
      const exactSearches = [];
      const facetSearchNames = _.isEmpty(req.query.facetNames) ? [] : req.query.facetNames.split(',');
      const facetSearches = [];

      _.forEach(exactSearchNames, (exactSearch) => {
        exactSearches.push({ name: exactSearch, value: req.query[`exact_${exactSearch}`] });
      });
      _.forEach(facetSearchNames, (facetSearch) => {
        facetSearches.push({ name: facetSearch, value: req.query[`facet_${facetSearch}`] });
      });


      RecordsService.searchFuzzy(type, workflow, searchString, exactSearches, facetSearches, brand, req.user, req.user.roles, sails.config.record.search.returnFields)
        .subscribe(searchRes => {
          this.ajaxOk(req, res, null, searchRes);
        }, error => {
          this.ajaxFail(req, res, error.message);
        });
    }
    /** Returns the RecordType configuration */
    public getType(req, res) {
      const recordType = req.param('recordType');
      const brand = BrandingService.getBrand(req.session.branding);
      RecordTypesService.get(brand, recordType).subscribe(recordType => {
        this.ajaxOk(req, res, null, recordType);
      }, error => {
        this.ajaxFail(req, res, error.message);
      });
    }

    /** Returns all RecordTypes configuration */
    public getAllTypes(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      RecordTypesService.getAll(brand).subscribe(recordTypes => {
        this.ajaxOk(req, res, null, recordTypes);
      }, error => {
        this.ajaxFail(req, res, error.message);
      });
    }

    protected tusServer: any;

    protected initTusServer() {
      if (!this.tusServer) {
        this.tusServer = new tus.Server();
        const targetDir = sails.config.record.attachments.stageDir;
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir);
        }
        // path below is appended to the 'Location' header, so it must match the routes for this controller if you want to keep your sanity
        this.tusServer.datastore = new tus.FileStore({
          path: sails.config.record.attachments.path,
          directory: targetDir
        });
        this.tusServer.on(tus.EVENTS.EVENT_UPLOAD_COMPLETE, (event) => {
          sails.log.verbose(`::: File uploaded to staging:`);
          sails.log.verbose(JSON.stringify(event));
        });
        this.tusServer.on(tus.EVENTS.EVENT_FILE_CREATED, (event) => {
          sails.log.verbose(`::: File created:`);
          sails.log.verbose(JSON.stringify(event));
        });
      }
    }

    protected getTusMetadata(req, field: string): string {
      const entries = {};
      _.each(req.headers['upload-metadata'].split(','), (entry) => {
        const elems = entry.split(' ');
        entries[elems[0]] = elems[1];
      });
      return Buffer.from(entries[field], 'base64').toString('ascii');
    }

    public doAttachment(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const oid = req.param('oid');
      const attachId = req.param('attachId');
      this.initTusServer();
      const method = _.toLower(req.method);
      if (method == 'post') {
        req.baseUrl = `${sails.config.appPort ? `:${sails.config.appPort}` : ''}/${req.session.branding}/${req.session.portal}/record/${oid}`
      } else {
        req.baseUrl = '';
      }
      return this.getRecord(oid).flatMap(currentRec => {
        return this.hasEditAccess(brand, req.user, currentRec).flatMap(hasEditAccess => {
          if (!hasEditAccess) {
            return Observable.throw(new Error(TranslationService.t('edit-error-no-permissions')));
          }
          if (method == 'get') {
            // check if this attachId exists in the record
            let found = null;
            _.each(currentRec.metaMetadata.attachmentFields, (attField) => {
              if (!found) {
                const attFieldVal = currentRec.metadata[attField];
                found = _.find(attFieldVal, (attVal) => {
                  return attVal.fileId == attachId
                });
                if (found) {
                  return false;
                }
              }
            });
            if (!found) {
              return Observable.throw(new Error(TranslationService.t('attachment-not-found')))
            }
            res.set('Content-Type', found.mimeType);
            res.set('Content-Disposition', `attachment; filename="${found.name}"`);
            sails.log.verbose(`Returning datastream observable of ${oid}: ${found.name}, attachId: ${attachId}`);
            return RecordsService.getDatastream(oid, attachId).flatMap((response) => {
              res.end(Buffer.from(response.body), 'binary');
              return Observable.of(oid);
            });
          } else {
            // process the upload...
            this.tusServer.handle(req, res);
            return Observable.of(oid);
          }
        });
      })
        .subscribe(whatever => {
          // ignore...
        }, error => {
          if (this.isAjax(req)) {
            this.ajaxFail(req, res, error.message);
          } else {
            if (error.message == TranslationService.t('edit-error-no-permissions')) {
              res.forbidden();
            } else if (error.message == TranslationService.t('attachment-not-found')) {
              res.notFound();
            }
          }
        });
    }

    public getWorkflowSteps(req, res) {
      const recordType = req.param('recordType');
      const brand = BrandingService.getBrand(req.session.branding);
      return RecordTypesService.get(brand, recordType).subscribe(recordType => {
        return WorkflowStepsService.getAllForRecordType(recordType).subscribe(wfSteps => {
          return this.ajaxOk(req, res, null, wfSteps);
        });
      });
    }

    public getAttachments(req, res) {
      const oid = req.param('oid');
      return RecordsService.listDatastreams(oid).subscribe(datastreams => {
        let attachments = [];

        _.each(datastreams['datastreams'], datastream => {
          let attachment = {};
          attachment['dateUpdated'] = moment(datastream['lastModified']['$date']).format();
          attachment['label'] = datastream['label'];
          attachment['contentType'] = datastream['contentType'];
          attachments.push(attachment);
        });
        return this.ajaxOk(req, res, null, attachments);
      });
    }

    public getDataStream(req, res) {
      const brand = BrandingService.getBrand(req.session.branding);
      const oid = req.param('oid');
      const datastreamId = req.param('datastreamId');

      return this.getRecord(oid).flatMap(currentRec => {
        return this.hasEditAccess(brand, req.user, currentRec).flatMap(hasEditAccess => {
          if (!hasEditAccess) {
            return Observable.throw(new Error(TranslationService.t('edit-error-no-permissions')));
          } else {
            const fileName = req.param('fileName') ? req.param('fileName') : datastreamId;
            res.set('Content-Type', 'application/octet-stream');
            res.set('Content-Disposition', `attachment; filename="${fileName}"`);
            sails.log.verbose(`Returning datastream observable of ${oid}: ${fileName}, datastreamId: ${datastreamId}`);
            return RecordsService.getDatastream(oid, datastreamId).flatMap((response) => {
              res.end(Buffer.from(response.body), 'binary');
              return Observable.of(oid);
            });
          }
        })
      }).subscribe(whatever => {
        // ignore...
      }, error => {
        if (this.isAjax(req)) {
          this.ajaxFail(req, res, error.message);
        } else {
          if (error.message == TranslationService.t('edit-error-no-permissions')) {
            res.forbidden();
          } else if (error.message == TranslationService.t('attachment-not-found')) {
            res.notFound();
          }
        }
      });
    }

    /**
     **************************************************************************************************
     **************************************** Override magic methods **********************************
     **************************************************************************************************
     */
  }
}

module.exports = new Controllers.Record().exports();
