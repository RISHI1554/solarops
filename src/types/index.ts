export type UserRole = 'customer' | 'technician' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  electricity_conn_no?: string;
  created_at?: string;
}

export interface SolarPackage {
  id: string;
  name: string;
  capacity_kw: number;
  panel_count: number;
  panel_type: string;
  inverter_type: string;
  price_inr: number;
  description: string;
  warranty_years: number;
  roof_area_sqft: number;
  monthly_gen_units: number;
  is_active: boolean;
  created_at?: string;
}

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface InstallationStage {
  id: string;
  request_id: string;
  stage_number: number; // 1 to 7
  stage_name: string;
  status: StageStatus;
  technician_notes?: string;
  updated_by_name?: string;
  completed_at?: string;
  updated_at?: string;
}

export type InstallationStatus = 'pending_review' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface InstallationRequest {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  package_id?: string;
  package_name?: string;
  capacity_kw: number;
  property_address: string;
  roof_type: 'RCC Flat' | 'Tin Shed' | 'Tiled Roof' | 'Industrial Shed' | 'Other';
  electricity_conn_no: string;
  discom_provider: string;
  sanctioned_load_kw: number;
  status: InstallationStatus;
  current_stage: number; // 1 to 7
  assigned_technician_id?: string;
  assigned_technician_name?: string;
  assigned_technician_phone?: string;
  scheduled_date?: string;
  estimated_completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  stages?: InstallationStage[];
}

export type BillStatus = 'unpaid' | 'partially_paid' | 'fully_paid';

export interface Bill {
  id: string;
  request_id: string;
  customer_id: string;
  customer_name?: string;
  package_name?: string;
  capacity_kw?: number;
  total_amount: number;
  subsidy_amount: number;
  net_payable: number;
  emi_tenure_months: number;
  emi_monthly_amount: number;
  status: BillStatus;
  created_at: string;
  emis?: EmiSchedule[];
}

export type EmiStatus = 'paid' | 'pending' | 'overdue';

export interface EmiSchedule {
  id: string;
  bill_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: EmiStatus;
  paid_at?: string;
  payment_method?: 'upi' | 'card' | 'netbanking';
  demo_receipt_id?: string;
}

export interface DemoPayment {
  id: string;
  emi_id: string;
  bill_id: string;
  customer_id: string;
  customer_name?: string;
  installment_number?: number;
  amount: number;
  payment_mode: 'upi' | 'card' | 'netbanking';
  transaction_ref: string;
  status: 'success';
  is_demo: true;
  notes: string;
  created_at: string;
}

export type SubsidyStatus = 'submitted' | 'document_verified' | 'technical_sanction' | 'inspection_passed' | 'disbursed';

export interface SubsidyApplication {
  id: string;
  request_id: string;
  customer_id: string;
  customer_name?: string;
  scheme_name: string;
  application_number: string;
  sanctioned_amount: number;
  status: SubsidyStatus;
  disbursed_date?: string;
  bank_ref?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ComplaintCategory = 'inverter_issue' | 'panel_damage' | 'generation_drop' | 'metering_delay' | 'wiring_issue' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Complaint {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  request_id?: string;
  assigned_technician_id?: string;
  assigned_technician_name?: string;
  ticket_number: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
  updated_at: string;
}

export interface PaymentReceipt {
  receipt_id: string;
  transaction_ref: string;
  payment_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address?: string;
  electricity_conn_no?: string;
  bill_id: string;
  installment_number: number;
  amount_paid: number;
  payment_mode: 'upi' | 'card' | 'netbanking';
  is_demo: boolean;
  package_name?: string;
  capacity_kw?: number;
}
