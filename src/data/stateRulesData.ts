/** State licensing rules — exported from Provider Compliance Dashboard (State Rules- NEW) */
export interface StateRuleRow {
  stateId: string;
  stateLabel: string;
  compact: string;
  operational: string;
  requiredSteps: string;
  deaCsrs: string;
  cpaRequired: string;
  notes: string;
}

export const STATE_RULES_ROWS: StateRuleRow[] = [
  { stateId: "AK", stateLabel: 'Alaska', compact: 'No', operational: 'No', requiredSteps: 'RN → NP → DEA', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 2, 3, 4, 5.' },
  { stateId: "AL", stateLabel: 'Alabama', compact: 'No', operational: 'No', requiredSteps: 'N/A- Pending MD? ', deaCsrs: 'No', cpaRequired: 'Yes', notes: ' MD ONLY' },
  { stateId: "AR", stateLabel: 'Arkansas', compact: 'Yes', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'No', notes: 'Async/Non Controlled' },
  { stateId: "AZ", stateLabel: 'Arizona', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "CA", stateLabel: 'California', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → Furnishing license → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Conditional', notes: 'Full Practice state. Telehealth note: If NP is CA-licensed, practicing through CA-based entity, and treating CA patients via telehealth, this constitutes clinical practice in CA. CA telehealth law treats telehealth as equivalent to in-person care. An NP conducting assessments, diagnosing, prescribing, and managing patients via telehealth is still providing direct patient care. Note: 103 NP Application rules apply.' },
  { stateId: "CO", stateLabel: 'Colorado', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → RX authority → PMP → CPA', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "CT", stateLabel: 'Connecticut', compact: 'No', operational: 'No', requiredSteps: 'NP-> Autonomous if eligible', deaCsrs: 'No', cpaRequired: 'No', notes: 'Async/Non Controlled' },
  { stateId: "DC", stateLabel: 'Washington D.C.', compact: 'No', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "DE", stateLabel: 'Delaware', compact: 'No', operational: 'No', requiredSteps: 'NP ', deaCsrs: 'NO', cpaRequired: 'NO', notes: 'NON CONTROLLED STATE, Async Only' },
  { stateId: "FL", stateLabel: 'Florida', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Conditional', notes: '' },
  { stateId: "GA", stateLabel: 'Georgia', compact: 'No', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'No', notes: 'MD ONLY' },
  { stateId: "HI", stateLabel: 'Hawaii', compact: 'No', operational: 'No', requiredSteps: 'NON CONTROLLED STATE- RN--> NP only! ', deaCsrs: 'N/A ', cpaRequired: 'No', notes: 'NON CONTROLLED STATE, Async Only' },
  { stateId: "IA", stateLabel: 'Iowa', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "ID", stateLabel: 'Idaho', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "IL", stateLabel: 'Illinois', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → CSR → PMP → CPA', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "IN", stateLabel: 'Indiana', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR/CPA → PMP', deaCsrs: 'Yes', cpaRequired: 'Conditional', notes: 'Schedule 3, 4, 5.' },
  { stateId: "KS", stateLabel: 'Kansas', compact: 'Yes', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "KY", stateLabel: 'Kentucky', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP', deaCsrs: 'No', cpaRequired: 'Yes', notes: 'No CSRs needed. Fountain NPs do not prescribe in KY.' },
  { stateId: "LA", stateLabel: 'Louisiana', compact: 'No', operational: 'No', requiredSteps: 'NON CONTROLLED STATE- NP only! ', deaCsrs: 'N/A ', cpaRequired: 'Yes', notes: 'NON CONTROLLED STATE, Need 2 CPA\'s' },
  { stateId: "MA", stateLabel: 'Massachusetts', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → MassHealth nonbillable app → CSR → PMP', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'MassHealth nonbillable app required. PEC contact: PEC@maximus.com. MassHealth Customer Service: Provider@masshealthquestions.com or (800) 841-2900. MA BON phone: (617) 973-0800.' },
  { stateId: "MD", stateLabel: 'Maryland', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP → CPA', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5. State DEA specific.' },
  { stateId: "ME", stateLabel: 'Maine', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "MI", stateLabel: 'Michigan', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "MN", stateLabel: 'Minnesota', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "MO", stateLabel: 'Missouri', compact: 'Yes', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "MS", stateLabel: 'Mississippi', compact: 'Yes', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'Yes', notes: 'Async/non controlled' },
  { stateId: "MT", stateLabel: 'Montana', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → RX authority → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "NC", stateLabel: 'North Carolina', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "ND", stateLabel: 'North Dakota', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "NE", stateLabel: 'Nebraska', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "NH", stateLabel: 'New Hampshire', compact: 'No', operational: 'No', requiredSteps: 'NP-> Non Controlled State', deaCsrs: 'No', cpaRequired: 'Yes', notes: 'Async/non contolled for NP\'s' },
  { stateId: "NJ", stateLabel: 'New Jersey', compact: 'No', operational: 'Yes', requiredSteps: 'NP → CSR → PMP → CPA', deaCsrs: 'Yes', cpaRequired: 'Yes', notes: 'Schedule 3, 4, 5.' },
  { stateId: "NM", stateLabel: 'New Mexico', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP → CPA', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "NV", stateLabel: 'Nevada', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → CSR → PMP → CPA', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "NY", stateLabel: 'New York', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: 'If living in NY and needs DEA in NY: Schedule 2, 3, 4, 5.' },
  { stateId: "OH", stateLabel: 'Ohio', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "OK", stateLabel: 'Oklahoma', compact: 'No', operational: 'No', requiredSteps: 'NP, Independent P.A-> NON CONTROLLED STATE', deaCsrs: 'No', cpaRequired: 'Yes', notes: 'Async only' },
  { stateId: "OR", stateLabel: 'Oregon', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "PA", stateLabel: 'Pennsylvania', compact: 'No', operational: 'Yes', requiredSteps: 'RN → NP → RX authority → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Yes', notes: 'Schedule 3, 4, 5. MDs and DOs do not need a separate prescriptive RX license or authority registration in addition to their primary medical license.' },
  { stateId: "RI", stateLabel: 'Rhode Island', compact: 'Yes', operational: 'No', requiredSteps: 'NP only NON CONTROLLED STATE', deaCsrs: 'N/A ', cpaRequired: 'No', notes: 'NON CONTROLLED STATE' },
  { stateId: "SC", stateLabel: 'South Carolina', compact: 'Yes', operational: 'No', requiredSteps: 'N/A', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "SD", stateLabel: 'South Dakota', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5.' },
  { stateId: "TN", stateLabel: 'Tennessee', compact: 'No', operational: 'Yes', requiredSteps: 'NP → CSR → PMP → CPA', deaCsrs: 'Yes', cpaRequired: 'Yes', notes: 'Schedule 3, 4, 5.' },
  { stateId: "TX", stateLabel: 'Texas', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "UT", stateLabel: 'Utah', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP', deaCsrs: 'Yes', cpaRequired: 'No', notes: 'Schedule 3, 4, 5. State DEA specific.' },
  { stateId: "VA", stateLabel: 'Virginia', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "VT", stateLabel: 'Vermont', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "WA", stateLabel: 'Washington', compact: 'No', operational: 'Yes', requiredSteps: 'NP → PMP', deaCsrs: 'No', cpaRequired: 'No', notes: '' },
  { stateId: "WI", stateLabel: 'Wisconsin', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → PMP → CPA', deaCsrs: 'No', cpaRequired: 'Yes', notes: '' },
  { stateId: "WV", stateLabel: 'West Virginia', compact: 'Yes', operational: 'No', requiredSteps: 'NP → Pres Auth → CSE → DEA → PMP', deaCsrs: 'Yes', cpaRequired: 'Conditional', notes: '' },
  { stateId: "WY", stateLabel: 'Wyoming', compact: 'Yes', operational: 'Yes', requiredSteps: 'NP → CSR → PMP', deaCsrs: 'Yes', cpaRequired: 'No', notes: '' },
];
