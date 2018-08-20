/**
 * RDMP form
 */
module.exports = {
  name: 'default-1.0-draft',
  type: 'rdmp',
  skipValidationOnSave: false,
  editCssClasses: 'row col-md-12',
  viewCssClasses: 'row col-md-offset-1 col-md-10',
  messages: {
    "saving": ["@dmpt-form-saving"],
    "validationFail": ["@dmpt-form-validation-fail-prefix", "@dmpt-form-validation-fail-suffix"],
    "saveSuccess": ["@dmpt-form-save-success"],
    "saveError": ["@dmpt-form-save-error"]
  },
  fields: [{
      class: 'Container',
      compClass: 'TextBlockComponent',
      viewOnly: true,
      definition: {
        name: 'title',
        type: 'h1'
      }
    },
    {
      class: 'Container',
      compClass: 'GenericGroupComponent',
      definition: {
        cssClasses: "form-inline",
        fields: [{
            class: "AnchorOrButton",
            viewOnly: true,
            definition: {
              label: '@dmp-edit-record-link',
              value: '/@branding/@portal/record/edit/@oid',
              cssClasses: 'btn btn-large btn-info',
              showPencil: true,
              controlType: 'anchor'
            },
            variableSubstitutionFields: ['value']
          },
          {
              class: "AnchorOrButton",
              viewOnly: true,
              definition: {
                label: '@dmp-create-datarecord-link',
                value: '/@branding/@portal/record/dataRecord/edit?rdmpOid=@oid',
                cssClasses: 'btn btn-large btn-info margin-15',
                controlType: 'anchor'
              },
              variableSubstitutionFields: ['value']
            },
          {
            class: 'PDFList',
            viewOnly: true,
            definition: {
              name: 'pdf',
              label: 'pdf',
              cssClasses: 'btn btn-large btn-info margin-15'
            }
          }
        ]
      }
    },
    {
      class: 'TextArea',
      viewOnly: true,
      definition: {
        name: 'description',
        label: 'Description'
      }
    },
    {
      class: "TabOrAccordionContainer",
      compClass: "TabOrAccordionContainerComponent",
      definition: {
        id: "mainTab",
        accContainerClass: "view-accordion",
        expandAccordionsOnOpen: true,
        fields: [
          // -------------------------------------------------------------------
          // Welcome Tab - removed before launch be agreement
          // -------------------------------------------------------------------
/*
          {
            class: "Container",
            editOnly: true,
            definition: {
              id: "welcome",
              label: "@dmpt-welcome-tab",
              active: true,
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-welcome-heading',
                    type: 'h3'
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-welcome-par1'
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-welcome-par2'
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-welcome-par3'
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-welcome-par4'
                  }
                }
              ]
            }
          },
*/
          // -------------------------------------------------------------------
          // Project Tab
          // -------------------------------------------------------------------
          {
            class: "Container",
            definition: {
              id: "project",
              label: "@dmpt-project-tab",
              active: true,
              fields: [
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-project-heading',
                    type: 'h3'
                  }
                },
                {
  class: 'VocabField',
  compClass: 'VocabFieldComponent',
  definition: {
    name: 'title',
    label: "@dmpt-project-title",
    help: "@dmpt-project-title-help",
    forceClone: ['lookupService', 'completerService'],
    disableEditAfterSelect: false,
    vocabId: 'Research Activities AND%20(status:(%22Completed%22%20OR%20%22Approved%22%20OR%20%22Closed%20off%22%20OR%20%22Combined%22%20OR%20%22Transferred%22))',
    sourceType: 'mint',
    fieldNames: ['dc_title', 'folio', 'description', 'summary', 'refId', 'keyword', 'startDate', 'endDate', 'organization', 'fundingSource'],
    searchFields: 'autocomplete_title',
    titleFieldArr: ['dc_title'],
    stringLabelToField: 'dc_title',
    storeLabelOnly : true,
    publish: {},
    required: true
  }
}
,
{
class: 'TextField',
editOnly: true,
definition: {
name: 'dc:identifier',
label: '@dmpt-project-id',
help: '@dmpt-project-id-help',
type: 'text',
required: true,
subscribe: {
title: {
onItemSelect: [
{
action: 'utilityService.getFirstofArray',
field: 'folio'
}
]
}
}
}
}
,
{
class: 'TextArea',
compClass: 'TextAreaComponent',
editOnly: true,
definition: {
name: 'description',
label: '@dmpt-project-desc',
help: '@dmpt-project-desc-help',
rows: 10,
cols: 10,
required: true,
subscribe: {
title: {
onItemSelect: [
{
action: 'utilityService.concatenate',
fields: [
'description',
'summary'
],
delim: ' '
}
]
}
}
}
}
,
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    type: 'hr'
                  }
                },
                {
  class: 'RepeatableContainer',
    compClass: 'RepeatableTextfieldComponent',
    definition: {
    label: '@dmpt-finalKeywords',
      help: '@dmpt-finalKeywords-help',
      name: 'finalKeywords',
      editOnly: true,
      fields: [
      {
        class: 'TextField',
        definition: {
          type: 'text'
        }
      }
    ],
      subscribe: {
      title: {
        onItemSelect: [
          {
            action: 'utilityService.splitArrayStringsToArray',
            field: 'keyword',
            regex: ',|;',
            flags: 'i'
          }
        ]
      }
    }
  }
}
,
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    type: 'hr'
                  }
                },
                {
                  class: 'TextField',
                  definition: {
                    name: 'dc:relation_bibo:Website',
                    label: '@dmpt-project-website',
                    help: '@dmpt-project-website-help',
                    type: 'text'
                  }
                },
                {
                  class: 'DateTime',
                  definition: {
                    name: "dc:coverage_vivo:DateTimeInterval_vivo:start",
                    label: "@dmpt-project-startdate",
                    help: '@dmpt-project-startdate-help',
                    datePickerOpts: {
                      format: 'dd/mm/yyyy',
                      icon: 'fa fa-calendar',
                      autoclose: true
                    },
                    timePickerOpts: false,
                    hasClearButton: false,
                    valueFormat: 'YYYY-MM-DD',
                    displayFormat: 'L',
                    publish: {
                      onValueUpdate: {
                        modelEventSource: 'valueChanges'
                      }
                    }
                  }
                },
                {
                  class: 'DateTime',
                  definition: {
                    name: "dc:coverage_vivo:DateTimeInterval_vivo:end",
                    label: "@dmpt-project-enddate",
                    help: '@dmpt-project-enddate-help',
                    datePickerOpts: {
                      format: 'dd/mm/yyyy',
                      icon: 'fa fa-calendar',
                      autoclose: true
                    },
                    timePickerOpts: false,
                    hasClearButton: false,
                    valueFormat: 'YYYY-MM-DD',
                    displayFormat: 'L',
                    subscribe: {
                      'dc:coverage_vivo:DateTimeInterval_vivo:start': {
                        onValueUpdate: []
                      }
                    }
                  }
                },
                {
                  class: 'RepeatableContainer',
                  compClass: 'RepeatableVocabComponent',
                  definition: {
                    name: 'foaf:fundedBy_foaf:Agent',
                    label: "@dmpt-foaf:fundedBy_foaf:Agent",
                    help: "@dmpt-foaf:fundedBy_foaf:Agent-help",
                    forceClone: ['lookupService', 'completerService'],
                    fields: [{
                      class: 'VocabField',
                      definition: {
                        disableEditAfterSelect: false,
                        vocabId: 'Funding Bodies',
                        sourceType: 'mint',
                        fieldNames: ['dc_title', 'dc_identifier', 'ID', 'repository_name'],
                        searchFields: 'dc_title',
                        titleFieldArr: ['dc_title'],
                        stringLabelToField: 'dc_title'
                      }
                    }]
                  }
                },
                {
                  class: 'RepeatableContainer',
                  compClass: 'RepeatableVocabComponent',
                  definition: {
                    name: 'foaf:fundedBy_vivo:Grant',
                    label: "@dmpt-foaf:fundedBy_vivo:Grant",
                    help: "@dmpt-foaf:fundedBy_vivo:Grant-help",
                    forceClone: ['lookupService', 'completerService'],
                    fields: [{
                      class: 'VocabField',
                      definition: {
                        disableEditAfterSelect: false,
                        vocabId: 'Research Activities',
                        sourceType: 'mint',
                        fieldNames: ['dc_title', 'grant_number', 'foaf_name', 'dc_identifier', 'known_ids', 'repository_name'],
                        searchFields: 'grant_number,dc_title',
                        titleFieldArr: ['grant_number', 'repository_name', 'dc_title'],
                        titleFieldDelim: [{
                            prefix: '[',
                            suffix: ']'
                          },
                          {
                            prefix: ' (',
                            suffix: ')'
                          },
                          {
                            prefix: ' ',
                            suffix: ''
                          }
                        ],
                        stringLabelToField: 'dc_title'
                      }
                    }],
                    publish: {
                      onValueUpdate: {
                        modelEventSource: 'valueChanges',
                        // optional, renames fields `{field: sourcefield}` accessed using _.get, remove to return the entire data set
                        fields: [{
                          'grant_number': 'grant_number[0]'
                        }, {
                          'dc_title': 'dc_title'
                        }]
                      }
                    }
                  }
                },
/* removed due to decision not to require TOA
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'dc:subject_anzsrc:toa_rdf:resource',
                    label: '@dmpt-project-activity-type',
                    help: '@dmpt-project-activity-type-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        value: "pure",
                        label: "@dmpt-activity-type-pure"
                      },
                      {
                        value: "strategic",
                        label: "@dmpt-activity-type-strategic"
                      },
                      {
                        value: "applied",
                        label: "@dmpt-activity-type-applied"
                      },
                      {
                        value: "experimental",
                        label: "@dmpt-activity-type-experimental"
                      }
                    ]
                  }
                },
*/
                {
                  class: 'ANDSVocab',
                  compClass: 'ANDSVocabComponent',
                  definition: {
                    label: "@dmpt-project-anzsrcFor",
                    help: "@dmpt-project-anzsrcFor-help",
                    name: "dc:subject_anzsrc:for",
                    vocabId: 'anzsrc-for'
                  }
                },
                {
                  class: 'ANDSVocab',
                  compClass: 'ANDSVocabComponent',
                  definition: {
                    label: "@dmpt-project-anzsrcSeo",
                    help: "@dmpt-project-anzsrcSeo-help",
                    name: "dc:subject_anzsrc:seo",
                    vocabId: 'anzsrc-seo'
                  }
                }
              ]
            }
          },
          // -------------------------------------------------------------------
          // People Tab
          // -------------------------------------------------------------------
          {
            class: "Container",
            definition: {
              id: "people",
              label: "@dmpt-people-tab",
              fields: [{
                  class: 'ContributorField',
                  showHeader: true,
                  showRole: false,
                  definition: {
                    name: 'contributor_ci',
                    required: true,
                    label: '@dmpt-people-tab-ci',
                    help: '@dmpt-people-tab-ci-help',
                    role: "@dmpt-people-tab-ci-role",
                    freeText: false,
                    forceLookupOnly: true,
                    vocabId: 'Parties AND repository_name:People',
                    sourceType: 'mint',
                    disabledExpression: '<%= !_.isEmpty(oid) %>',
                    fieldNames: [{
                      'text_full_name': 'text_full_name'
                    }, {
                      'full_name_honorific': 'text_full_name_honorific'
                    }, {
                      'email': 'Email[0]'
                    },
                    {
                      'given_name': 'Given_Name[0]'
                    },
                    {
                      'family_name': 'Family_Name[0]'
                    },
                    {
                      'honorific': 'Honorific[0]'
                    },
                    {
                      'full_name_family_name_first': 'dc_title'
                    }],
                    searchFields: 'autocomplete_given_name,autocomplete_family_name,autocomplete_full_name',
                    titleFieldArr: ['text_full_name'],
                    titleFieldDelim: '',
                    nameColHdr: '@dmpt-people-tab-name-hdr',
                    emailColHdr: '@dmpt-people-tab-email-hdr',
                    orcidColHdr: '@dmpt-people-tab-orcid-hdr',
                    validation_required_name: '@dmpt-people-tab-validation-name-required',
                    validation_required_email: '@dmpt-people-tab-validation-email-required',
                    validation_invalid_email: '@dmpt-people-tab-validation-email-invalid',
                    publish: {
                      onValueUpdate: {
                        modelEventSource: 'valueChanges'
                      }
                    }
                  }
                },
                {
                  class: 'ContributorField',
                  showHeader: true,
                  definition: {
                    name: 'contributor_data_manager',
                    required: true,
                    label: '@dmpt-people-tab-data-manager',
                    help: '@dmpt-people-tab-data-manager-help',
                    role: "@dmpt-people-tab-data-manager-role",
                    freeText: false,
                    vocabId: 'Parties AND repository_name:People',
                    sourceType: 'mint',
                    disabledExpression: '<%= !_.isEmpty(oid) %>',
                    fieldNames: [{
                      'text_full_name': 'text_full_name'
                    }, {
                      'full_name_honorific': 'text_full_name_honorific'
                    }, {
                      'email': 'Email[0]'
                    },
                    {
                      'given_name': 'Given_Name[0]'
                    },
                    {
                      'family_name': 'Family_Name[0]'
                    },
                    {
                      'honorific': 'Honorific[0]'
                    },
                    {
                      'full_name_family_name_first': 'dc_title'
                    }],
                    searchFields: 'autocomplete_given_name,autocomplete_family_name,autocomplete_full_name',
                    titleFieldArr: ['text_full_name'],
                    titleFieldDelim: '',
                    nameColHdr: '@dmpt-people-tab-name-hdr',
                    emailColHdr: '@dmpt-people-tab-email-hdr',
                    orcidColHdr: '@dmpt-people-tab-orcid-hdr',
                    showRole: false,
                    publish: {
                      onValueUpdate: {
                        modelEventSource: 'valueChanges'
                      }
                    },
                    value: {
                      name: '@user_name',
                      email: '@user_email',
                      username: '@user_username',
                      text_full_name: '@user_name'
                    }
                  },
                  variableSubstitutionFields: ['value.name', 'value.email', 'value.username', 'value.text_full_name']
                },
                {
                  class: 'RepeatableContributor',
                  compClass: 'RepeatableContributorComponent',
                  definition: {
                    name: "contributors",
                    skipClone: ['showHeader', 'initialValue'],
                    forceClone: [{
                      field: 'vocabField',
                      skipClone: ['injector']
                    }],
                    fields: [{
                      class: 'ContributorField',
                      showHeader: true,
                      definition: {
                        required: false,
                        label: '@dmpt-people-tab-contributors',
                        help: '@dmpt-people-tab-contributors-help',
                        role: "@dmpt-people-tab-contributors-role",
                        freeText: false,
                        vocabId: 'Parties AND repository_name:People',
                        sourceType: 'mint',
                        fieldNames: [{
                          'text_full_name': 'text_full_name'
                        }, {
                          'full_name_honorific': 'text_full_name_honorific'
                        }, {
                          'email': 'Email[0]'
                        },
                        {
                          'given_name': 'Given_Name[0]'
                        },
                        {
                          'family_name': 'Family_Name[0]'
                        },
                        {
                          'honorific': 'Honorific[0]'
                        },
                        {
                          'full_name_family_name_first': 'dc_title'
                        }],
                        searchFields: 'autocomplete_given_name,autocomplete_family_name,autocomplete_full_name',
                        titleFieldArr: ['text_full_name'],
                        titleFieldDelim: '',
                        nameColHdr: '@dmpt-people-tab-name-hdr',
                        emailColHdr: '@dmpt-people-tab-email-hdr',
                        orcidColHdr: '@dmpt-people-tab-orcid-hdr',
                        showRole: false
                      }
                    }]
                  }
                },
                {
                  class: 'ContributorField',
                  showHeader: true,
                  definition: {
                    name: 'contributor_supervisor',
                    required: false,
                    label: '@dmpt-people-tab-supervisor',
                    help: '@dmpt-people-tab-supervisor-help',
                    role: "@dmpt-people-tab-supervisor-role",
                    freeText: false,
                    forceLookupOnly: true,
                    vocabId: 'Parties AND repository_name:People',
                    sourceType: 'mint',
                    fieldNames: [{
                      'text_full_name': 'text_full_name'
                    }, {
                      'full_name_honorific': 'text_full_name_honorific'
                    }, {
                      'email': 'Email[0]'
                    },
                    {
                      'given_name': 'Given_Name[0]'
                    },
                    {
                      'family_name': 'Family_Name[0]'
                    },
                    {
                      'honorific': 'Honorific[0]'
                    },
                    {
                      'full_name_family_name_first': 'dc_title'
                    }],
                    searchFields: 'autocomplete_given_name,autocomplete_family_name,autocomplete_full_name',
                    titleFieldArr: ['text_full_name'],
                    titleFieldDelim: '',
                    nameColHdr: '@dmpt-people-tab-name-hdr',
                    emailColHdr: '@dmpt-people-tab-email-hdr',
                    orcidColHdr: '@dmpt-people-tab-orcid-hdr',
                    showRole: false,
                    publish: {
                      onValueUpdate: {
                        modelEventSource: 'valueChanges'
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            class: "Container",
            definition: {
              id: "dataCollection",
              label: "@dmpt-data-collection-tab",
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-data-collection-heading',
                    type: 'h3'
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_redbox:DataCollectionMethodology',
                    label: '@dmpt-data-collection-methodology',
                    help: '@dmpt-data-collection-methodology-help',
                    rows: 5,
                    columns: 10,
                    required: true,
                    validationMessages: {
                      required: "@dmpt-data-collection-methodology-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_dc_format',
                    label: '@dmpt-vivo:Dataset_dc_format',
                    help: '@dmpt-vivo:Dataset_dc_format-help',
                    rows: 5,
                    columns: 10,
                    required: true,
                    validationMessages: {
                      required: "@dmpt-vivo:Dataset_dc_format-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_redbox:DataCollectionResources',
                    label: '@dmpt-vivo:Dataset_redbox:DataCollectionResources',
                    help: '@dmpt-vivo:Dataset_redbox:DataCollectionResources-help',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_redbox:DataAnalysisResources',
                    label: '@dmpt-vivo:Dataset_redbox:DataAnalysisResources',
                    help: '@dmpt-vivo:Dataset_redbox:DataAnalysisResources-help',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_redbox:MetadataStandard',
                    label: '@dmpt-vivo:Dataset_redbox:MetadataStandard',
                    help: '@dmpt-vivo:Dataset_redbox:MetadataStandard-help',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_redbox:DataStructureStandard',
                    label: '@dmpt-vivo:Dataset_redbox:DataStructureStandard',
                    help: '@dmpt-vivo:Dataset_redbox:DataStructureStandard-help',
                    rows: 5,
                    columns: 10
                  }
                }
              ]
            }
          },
          // -------------------------------------------------------------------
          // Storage Tab
          // -------------------------------------------------------------------
/* data storage tab removed by agreement at UAT meeting as it is not used
          {
            class: "Container",
            definition: {
              id: "storage",
              label: "@dmpt-storage-tab",
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-storage-heading',
                    type: 'h3'
                  }
                },

                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:extent',
                    label: '@dmpt-vivo:Dataset_dc:extent',
                    help: '@dmpt-vivo:Dataset_dc:extent-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        value: "@dmpt-vivo:Dataset_dc:extent-less-than-100GB",
                        label: "@dmpt-vivo:Dataset_dc:extent-less-than-100GB"
                      },
                      {
                        value: "@dmpt-vivo:Dataset_dc:extent-100GB-to-2TB",
                        label: "@dmpt-vivo:Dataset_dc:extent-100GB-to-2TB"
                      },
                      {
                        value: "@dmpt-vivo:Dataset_dc:extent-more-than-2TB",
                        label: "@dmpt-vivo:Dataset_dc:extent-more-than-2TB"
                      }
                    ],
                    required: true,
                    validationMessages: {
                      required: "@dmpt-vivo:Dataset_dc:extent-required"
                    }
                  }
                },
/* following is moved to workspace tab
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:location_rdf:PlainLiteral',
                    label: '@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral',
                    help: '@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-personal-equipment",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-personal-equipment"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-platforms",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-platforms"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-store",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-store"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-share-drive",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-share-drive"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-survey-platform",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-survey-platform"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-collab-space",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-collab-space"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-other",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-other"
                      }
                    ],
                    required: true,
                    validationMessages: {
                      required: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:location_skos:note',
                    label: '@dmpt-vivo:Dataset_dc:location_skos:note',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral',
                    label: '@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral',
                    help: '@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-personal-equipment",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-personal-equipment"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-platforms",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-platforms"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-store",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-store"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-share-drive",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-share-drive"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-survey-platform",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-survey-platform"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-collab-space",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-collab-space"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-other",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-other"
                      }
                    ],
                    required: true,
                    validationMessages: {
                      required: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:source_dc:location_skos:note',
                    label: '@dmpt-vivo:Dataset_dc:source_dc:location_skos:note',
                    rows: 5,
                    columns: 10
                  }
                }

              ]
            }
          },
*/
          // -------------------------------------------------------------------
          // Retention Tab
          // -------------------------------------------------------------------
          {
            class: "Container",
            definition: {
              id: "retention",
              label: "@dmpt-retention-tab",
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-retention-heading',
                    type: 'h3'
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'redbox:retentionPeriod_dc:date',
                    label: '@dmpt-redbox:retentionPeriod_dc:date',
                    help: '@dmpt-redbox:retentionPeriod_dc:date-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        value: "1year",
                        label: "@dmpt-redbox:retentionPeriod_dc:date-1year"
                      },
                      {
                        value: "5years",
                        label: "@dmpt-redbox:retentionPeriod_dc:date-5years"
                      },
                      {
                        value: "7years",
                        label: "@dmpt-redbox:retentionPeriod_dc:date-7years"
                      },
                      {
                        value: "25years",
                        label: "@dmpt-redbox:retentionPeriod_dc:date-25years"
                      },
/*                      {
                        value: "20years",
                        label: "@dmpt-redbox:retentionPeriod_dc:date-20years"
                      },
*/
                      {
                        value: "permanent",
                        label: "@dmpt-redbox:retentionPeriod_dc:date-permanent"
                      }
                    ],
                    required: true,
                    validationMessages: {
                      required: "@dmpt-redbox:retentionPeriod_dc:date-required"
                    }
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'redbox:retentionPeriod_dc:date_skos:note',
                    label: '@dmpt-redbox:retentionPeriod_dc:date_skos:note',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        value: "heritage",
                        label: "@dmpt-redbox:retentionPeriod_dc:date_skos:note-heritage"
                      },
                      {
                        value: "controversial",
                        label: "@dmpt-redbox:retentionPeriod_dc:date_skos:note-controversial"
                      },
                      {
                        value: "ofinterest",
                        label: "@dmpt-redbox:retentionPeriod_dc:date_skos:note-ofinterest"
                      },
                      {
                        value: "costly_impossible",
                        label: "@dmpt-redbox:retentionPeriod_dc:date_skos:note-costly_impossible"
                      },
                      {
                        value: "commercial",
                        label: "@dmpt-redbox:retentionPeriod_dc:date_skos:note-commercial"
                      }
                    ]
                  }
                },
                {
                  class: 'TextField',
                  definition: {
                    name: 'dataowner_name',
                    label: '@dmpt-dataRetention_data_owner',
                    type: 'text',
                    readOnly: true,
                    subscribe: {
                      'contributor_ci': {
                        onValueUpdate: [{
                          action: 'utilityService.concatenate',
                          fields: ['text_full_name'],
                          delim: ''
                        }]
                      }
                    }
                  }
                },
                {
                  class: 'HiddenValue',
                  compClass: 'HiddenValueComponent',
                  definition: {
                    name: 'dataowner_email',
                    subscribe: {
                      'contributor_ci': {
                        onValueUpdate: [{
                          action: 'utilityService.concatenate',
                          fields: ['email'],
                          delim: ''
                        }]
                      }
                    }
                  }
                }

              ]
            }
          },
          // -------------------------------------------------------------------
          // Ownership Tab
          // -------------------------------------------------------------------
          {
            class: "Container",
            definition: {
              id: "ownership",
              label: "@dmpt-access-rights-tab",
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-access-rights-heading',
                    type: 'h3'
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'dc:rightsHolder_dc:name',
                    label: '@dmpt-dc:rightsHolder_dc:name',
                    help: '@dmpt-dc:rightsHolder_dc:name-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        value: "myUni",
                        label: "@dmpt-dc:rightsHolder_dc:name-myUni"
                      },
                      {
                        value: "myUnjount",
                        label: "@dmpt-dc:rightsHolder_dc:name-myUnjount"
                      },
                      {
                        value: "student",
                        label: "@dmpt-dc:rightsHolder_dc:name-student"
                      }
                    ],
                    required: true,
                    validationMessages: {
                      required: "@dmpt-dc:rightsHolder_dc:name-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'dc:rightsHolder_dc:description',
                    label: '@dmpt-dc:rightsHolder_dc:description',
                    help: '@dmpt-dc:rightsHolder_dc:description-help',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'redbox:ContractualObligations',
                    label: '@dmpt-redbox:ContractualObligations',
                    help: '@dmpt-redbox:ContractualObligations-help',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'RepeatableContainer',
                  compClass: 'RepeatableTextfieldComponent',
                  definition: {
                    label: "@dmpt-dc:coverage_dc:identifier",
                    help: "@dmpt-dc:coverage_dc:identifier-help",
                    name: "dc:coverage_dc:identifier",
                    editOnly: true,
                    fields: [{
                      class: 'TextField',
                      definition: {
                        type: 'text'
                      }
                    }]
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'SelectionFieldComponent',
                  definition: {
                    name: 'dc:accessRights',
                    label: '@dmpt-dc:accessRights',
                    help: '@dmpt-dc:accessRights-help',
                    defaultValue: '@dmpt-dc:accessRights-manager',
                    controlType: 'radio',
                    options: [{
                        value: "@dmpt-dc:accessRights-manager",
                        label: "@dmpt-dc:accessRights-manager"
                      },
                      {
                        value: "@dmpt-dc:accessRights-open",
                        label: "@dmpt-dc:accessRights-open"
                      },
                      {
                        value: "@dmpt-dc:accessRights-none-val",
                        label: "@dmpt-dc:accessRights-none"
                      }
                    ],
                    required: true
                  }
                },
                {
                  class: 'TextField',
                  definition: {
                    name: 'dataLicensingAccess_manager',
                    label: '@dmpt-dataLicensingAccess_manager',
                    type: 'text',
                    readOnly: true,
                    subscribe: {
                      'contributor_data_manager': {
                        onValueUpdate: [{
                          action: 'utilityService.concatenate',
                          fields: ['text_full_name'],
                          delim: ''
                        }]
                      }
                    },
                    value: '@user_name'
                  },
                  variableSubstitutionFields: ['value']
                }
              ]
            }
          },
          // -------------------------------------------------------------------
          // Ethics Tab
          // -------------------------------------------------------------------
          {
            class: "Container",
            definition: {
              id: "ethics",
              label: "@dmpt-ethics-tab",
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-ethics-heading',
                    type: 'h3'
                  }
                },
                {
                  class: 'TextField',
                  definition: {
                    name: 'agls:policy_dc:identifier',
                    label: '@dmpt-agls:policy_dc:identifier',
                    help: '@dmpt-agls:policy_dc:identifier-help',
                    type: 'text'
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'agls:policy_skos:note',
                    label: '@dmpt-agls:policy_skos:note',
                    help: '@dmpt-agls:policy_skos:note-help',
                    rows: 5,
                    columns: 10
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-etchics-sensitivities-heading',
                    type: 'h4'
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'SelectionFieldComponent',
                  definition: {
                    name: 'agls:protectiveMarking_dc:type',
                    label: '@dmpt-agls:protectiveMarking_dc:type',
                    help: '@dmpt-agls:protectiveMarking_dc:type-help',
                    controlType: 'checkbox',
                    options: [{
                        value: "agls:protectiveMarking_dc:type.redbox:CommerciallySensitive",
                        label: "@dmpt-agls:protectiveMarking_dc:type-commercial"
                      },
                      {
                        value: "agls:protectiveMarking_dc:type.redbox:CulturallySensitive",
                        label: "@dmpt-agls:protectiveMarking_dc:type-cultural"
                      },
                      {
                        value: "agls:protectiveMarking_dc:type.redbox:SecurityClassified",
                        label: "@dmpt-agls:protectiveMarking_dc:type-security"
                      },
                      {
                        value: "agls:protectiveMarking_dc:type.redbox:NonPublic",
                        label: "@dmpt-agls:protectiveMarking_dc:type-nonPublic"
                      }
                    ]
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'agls:protectiveMarking_skos:note',
                    label: '@dmpt-agls:protectiveMarking_skos:note',
                    help: '@dmpt-agls:protectiveMarking_skos:note-help',
                    rows: 5,
                    columns: 10
                  }
                },
                // Hiddden reactive elements...
                {
                  class: 'HiddenValue',
                  compClass: 'HiddenValueComponent',
                  definition: {
                    name: 'grant_number_name',
                    subscribe: {
                      'foaf:fundedBy_vivo:Grant': {
                        onValueUpdate: [{
                          action: 'utilityService.concatenate',
                          fields: ['grant_number', 'dc_title'],
                          delim: ' - '
                        }]
                      }
                    }
                  }
                }
              ]
            }
          },
          // -------------------------------------------------------------------
          // Workspaces Tab
          // -------------------------------------------------------------------
          {
            class: "Container",
            definition: {
              id: "workspaces",
              label: "@dmpt-workspaces-tab",
              fields: [{
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-workspaces-heading',
                    type: 'h3'
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  definition: {
                    value: '@dmpt-workspaces-associated-heading',
                    type: 'h4'
                  }
                },
                {
                  class: 'RelatedObjectDataField',
                  showHeader: true,
                  definition: {
                    name: 'workspaces',
                    columns: [{
                        "label": "Title",
                        "property": "title"
                      },
                      {
                        "label": "Description",
                        "property": "description"
                      },
                      {
                        "label": "Location",
                        "property": "location",
                        "link": "absolute"
                      },
                      {
                        "label": "Type",
                        "property": "type"
                      }
                    ]
                  }
                },
                {
                  class: 'Container',
                  compClass: 'TextBlockComponent',
                  editOnly: true,
                  definition: {
                    value: '@dmpt-workspaces-create-title',
                    type: 'h4'
                  }
                },
                {
                  class: 'WorkspaceSelectorField',
                  compClass: 'WorkspaceSelectorFieldComponent',
                  definition: {
                    name: 'WorkspaceSelector',
                    label: '@dmpt-workspace-select-type',
                    help: '@dmpt-workspace-select-help',
                    open: '@dmpt-workspace-open',
                    saveFirst: '@dmpt-workspace-saveFirst',
                    defaultSelection: [{
                      name: '',
                      label: '@dmpt-select:Empty'
                    }]
                  }
                },
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:location_rdf:PlainLiteral',
                    label: '@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral',
                    help: '@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-personal-equipment",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-personal-equipment"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-platforms",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-platforms"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-store",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-eresearch-store"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-share-drive",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-share-drive"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-survey-platform",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-survey-platform"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-collab-space",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-collab-space"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-other",
                        value: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-other"
                      }
                    ],
                    required: false,
                    validationMessages: {
                      required: "@dmpt-vivo:Dataset_dc:location_rdf:PlainLiteral-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:location_skos:note',
                    label: '@dmpt-vivo:Dataset_dc:location_skos:note',
                    rows: 5,
                    columns: 10
                  }
                },
/* this may not be required
                {
                  class: 'SelectionField',
                  compClass: 'DropdownFieldComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral',
                    label: '@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral',
                    help: '@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-help',
                    options: [{
                        value: "",
                        label: "@dmpt-select:Empty"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-personal",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-personal"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-eresearch-plat",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-eresearch-plat"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-eresearch-store",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-eresearch-store"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-shared",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-shared"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-survey-plat",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-survey-plat"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-collab",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-collab"
                      },
                      {
                        label: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-other",
                        value: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-other"
                      }
                    ],
                    required: false,
                    validationMessages: {
                      required: "@dmpt-vivo:Dataset_dc:source_dc:location_rdf:PlainLiteral-required"
                    }
                  }
                },
                {
                  class: 'TextArea',
                  compClass: 'TextAreaComponent',
                  definition: {
                    name: 'vivo:Dataset_dc:source_dc:location_skos:note',
                    label: '@dmpt-vivo:Dataset_dc:source_dc:location_skos:note',
                    rows: 5,
                    columns: 10
                  }
                }
*/
              ]
            }
          }
        ]
      }
    },
    {
      class: "ButtonBarContainer",
      compClass: "ButtonBarContainerComponent",
      definition: {
        editOnly: true,
        fields: [{
            class: "TabNavButton",
            definition: {
              id: 'mainTabNav',
              prevLabel: "@tab-nav-previous",
              nextLabel: "@tab-nav-next",
              targetTabContainerId: "mainTab",
              cssClasses: 'btn btn-primary'
            }
          },
          {
            class: "Spacer",
            definition: {
              width: '50px',
              height: 'inherit'
            }
          },
          {
            class: "SaveButton",
            definition: {
              label: 'Save',
              cssClasses: 'btn-success'
            }
          },
          {
            class: "SaveButton",
            definition: {
              label: 'Save & Close',
              closeOnSave: true,
              redirectLocation: '/@branding/@portal/dashboard/rdmp'
            },
            variableSubstitutionFields: ['redirectLocation']
          },
          {
            class: "CancelButton",
            definition: {
              label: 'Close',
            }
          }
        ]
      }
    },
    {
      class: "Container",
      definition: {
        id: "form-render-complete",
        label: "Test",
        fields: [{
          class: 'Container',
          compClass: 'TextBlockComponent',
          definition: {
            value: 'will be empty',
            type: 'span'
          }
        }]
      }
    }
  ]
}
