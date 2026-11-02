import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  SolarPackage,
  InstallationRequest,
  InstallationStage,
  InstallationStatus,
  StageStatus,
  Bill,
  EmiSchedule,
  DemoPayment,
  PaymentReceipt,
  SubsidyApplication,
  SubsidyStatus,
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from '../types';
import {
  INITIAL_PACKAGES,
  DEMO_USERS,
  INITIAL_INSTALLATIONS,
  INITIAL_STAGES_TEMPLATE,
  INITIAL_BILLS,
  INITIAL_EMIS,
  INITIAL_DEMO_PAYMENTS,
  INITIAL_SUBSIDIES,
  INITIAL_COMPLAINTS,
} from '../lib/demoData';
import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  isSupabaseActive: boolean;
  adminEmailConfig: string;
  profiles: UserProfile[];
  packages: SolarPackage[];
  installations: InstallationRequest[];
  stages: Record<string, InstallationStage[]>;
  bills: Bill[];
  emis: EmiSchedule[];
  payments: DemoPayment[];
  subsidies: SubsidyApplication[];
  complaints: Complaint[];
  latestReceipt: PaymentReceipt | null;
  setLatestReceipt: (receipt: PaymentReceipt | null) => void;
  // Auth & Roles
  switchDemoRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (data: {
    email: string;
    password?: string;
    full_name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    electricity_conn_no?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  // Actions
  createInstallationRequest: (data: {
    packageId?: string;
    capacityKw: number;
    propertyAddress: string;
    roofType: 'RCC Flat' | 'Tin Shed' | 'Tiled Roof' | 'Industrial Shed' | 'Other';
    electricityConnNo: string;
    discomProvider: string;
    sanctionedLoadKw: number;
    notes?: string;
  }) => Promise<InstallationRequest>;
  updateInstallationStatus: (
    requestId: string,
    updates: {
      status?: InstallationStatus;
      scheduledDate?: string;
      assignedTechnicianId?: string;
      estimatedCompletionDate?: string;
      notes?: string;
    }
  ) => Promise<void>;
  updateStageStatus: (
    requestId: string,
    stageNumber: number,
    status: StageStatus,
    notes?: string
  ) => Promise<void>;
  createPackage: (pkg: Omit<SolarPackage, 'id'>) => Promise<void>;
  updatePackage: (id: string, updates: Partial<SolarPackage>) => Promise<void>;
  deleteOrDeactivatePackage: (id: string) => Promise<void>;
  generateBill: (
    requestId: string,
    totalAmount: number,
    subsidyAmount: number,
    emiTenureMonths: number
  ) => Promise<Bill>;
  processDemoPayment: (
    emiId: string,
    paymentMode: 'upi' | 'card' | 'netbanking'
  ) => Promise<PaymentReceipt>;
  updateSubsidyStatus: (
    applicationId: string,
    status: SubsidyStatus,
    notes?: string,
    bankRef?: string
  ) => Promise<void>;
  createComplaint: (data: {
    requestId?: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    priority?: ComplaintPriority;
  }) => Promise<Complaint>;
  updateComplaint: (
    complaintId: string,
    status: ComplaintStatus,
    resolutionNotes?: string,
    assignedTechId?: string
  ) => Promise<void>;
  exportToCsv: (type: 'installations' | 'payments' | 'overdue_emis') => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'solarops_state_v1_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial seed
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profiles`);
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [packages, setPackages] = useState<SolarPackage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}packages`);
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [installations, setInstallations] = useState<InstallationRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}installations`);
    return saved ? JSON.parse(saved) : INITIAL_INSTALLATIONS;
  });

  const [stages, setStages] = useState<Record<string, InstallationStage[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stages`);
    if (saved) return JSON.parse(saved);
    return {
      'req-solar-001': INITIAL_STAGES_TEMPLATE('req-solar-001'),
    };
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bills`);
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [emis, setEmis] = useState<EmiSchedule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}emis`);
    return saved ? JSON.parse(saved) : INITIAL_EMIS;
  });

  const [payments, setPayments] = useState<DemoPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}payments`);
    return saved ? JSON.parse(saved) : INITIAL_DEMO_PAYMENTS;
  });

  const [subsidies, setSubsidies] = useState<SubsidyApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}subsidies`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSIDIES;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}complaints`);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  // Current active user - defaults to customer (Rahul Sharma)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    if (savedId) {
      const match = DEMO_USERS.find(u => u.id === savedId);
      if (match) return match;
    }
    return DEMO_USERS[0]; // Rahul Sharma
  });

  const [latestReceipt, setLatestReceipt] = useState<PaymentReceipt | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}packages`, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}installations`, JSON.stringify(installations));
  }, [installations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}stages`, JSON.stringify(stages));
  }, [stages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bills`, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}emis`, JSON.stringify(emis));
  }, [emis]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}subsidies`, JSON.stringify(subsidies));
  }, [subsidies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}complaints`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, currentUser.id);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    }
  }, [currentUser]);

  // Handle Supabase auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      } else {
        // Logged out
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const syncSupabaseUser = async (user: any) => {
    if (!supabase) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
      } else {
        // Determine role based on configured admin email
        const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL;
        const newProfile: UserProfile = {
          id: user.id,
          email: user.email,
          role: isAdmin ? 'admin' : (user.user_metadata?.role || 'customer'),
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          phone: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          pincode: user.user_metadata?.pincode || '',
          electricity_conn_no: user.user_metadata?.electricity_conn_no || '',
        };
        setCurrentUser(newProfile);
      }
    } catch (err) {
      console.warn('Supabase profile fetch error:', err);
    }
  };

  const currentRole: UserRole = currentUser?.role || 'customer';

  // Fast demo role switch
  const switchDemoRole = (role: UserRole) => {
    const demoUser = DEMO_USERS.find(u => u.role === role);
    if (demoUser) {
      setCurrentUser(demoUser);
    }
  };

  // Sign In
  const loginWithEmail = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if Supabase is active
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          await syncSupabaseUser(data.user);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Demo Mode Sign-In / Fallback
    const existing = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return { success: true };
    }

    // Auto-create or determine role if matching admin email
    const isAdmin = cleanEmail === ADMIN_EMAIL;
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'customer',
      full_name: cleanEmail.split('@')[0].replace('.', ' '),
      created_at: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);
    setCurrentUser(newProfile);
    return { success: true };
  };

  // Sign Up
  const signUpWithEmail = async (data: {
    email: string;
    password?: string;
    full_name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    electricity_conn_no?: string;
    role?: UserRole;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const assignedRole = cleanEmail === ADMIN_EMAIL ? 'admin' : (data.role || 'customer');

    if (isSupabaseConfigured && supabase && data.password) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              electricity_conn_no: data.electricity_conn_no,
              role: assignedRole,
            },
          },
        });
        if (error) return { success: false, error: error.message };
        if (authData.user) {
          await syncSupabaseUser(authData.user);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    // Demo registration
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      role: assignedRole,
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      electricity_conn_no: data.electricity_conn_no,
      created_at: new Date().toISOString(),
    };

    setProfiles(prev => [...prev, newProfile]);
    setCurrentUser(newProfile);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // Switch to null or back to demo customer
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setProfiles(prev => prev.map(p => (p.id === updated.id ? updated : p)));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(updates).eq('id', currentUser.id);
    }
  };

  // Create Installation Request
  const createInstallationRequest = async (data: {
    packageId?: string;
    capacityKw: number;
    propertyAddress: string;
    roofType: 'RCC Flat' | 'Tin Shed' | 'Tiled Roof' | 'Industrial Shed' | 'Other';
    electricityConnNo: string;
    discomProvider: string;
    sanctionedLoadKw: number;
    notes?: string;
  }): Promise<InstallationRequest> => {
    const pkg = packages.find(p => p.id === data.packageId);
    const newId = `req-solar-${Date.now().toString().slice(-4)}`;
    const custId = currentUser?.id || 'cust-rahul-01';
    const custName = currentUser?.full_name || 'Rahul Sharma';
    const custPhone = currentUser?.phone || '+91 98765 43210';
    const custEmail = currentUser?.email || 'rahul.sharma@gmail.com';

    const newRequest: InstallationRequest = {
      id: newId,
      customer_id: custId,
      customer_name: custName,
      customer_phone: custPhone,
      customer_email: custEmail,
      package_id: data.packageId,
      package_name: pkg?.name || `${data.capacityKw} kW Custom Solar System`,
      capacity_kw: data.capacityKw,
      property_address: data.propertyAddress,
      roof_type: data.roofType,
      electricity_conn_no: data.electricityConnNo,
      discom_provider: data.discomProvider,
      sanctioned_load_kw: data.sanctionedLoadKw,
      status: 'pending_review',
      current_stage: 1,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    // Auto-generate 7 stages
    const requestStages = INITIAL_STAGES_TEMPLATE(newId).map((st, idx) => ({
      ...st,
      status: (idx === 0 ? 'in_progress' : 'pending') as StageStatus,
      technician_notes: idx === 0 ? 'Initial site survey scheduled. Engineering team notified.' : undefined,
      completed_at: undefined,
    }));

    // Auto-create initial subsidy tracking record under PM Surya Ghar
    const calculatedSubsidy = data.capacityKw <= 1 ? 30000 : data.capacityKw <= 2 ? 60000 : 78000;
    const newSubsidy: SubsidyApplication = {
      id: `sub-${newId}`,
      request_id: newId,
      customer_id: custId,
      customer_name: custName,
      scheme_name: 'PM Surya Ghar: Muft Bijli Yojana',
      application_number: `PMSG-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      sanctioned_amount: calculatedSubsidy,
      status: 'submitted',
      notes: 'Application registered on PM Surya Ghar portal. DISCOM feasibility verification in progress.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Auto-generate estimated Bill & EMI for convenient immediate preview
    const totalPkgCost = pkg?.price_inr || data.capacityKw * 60000;
    const netPayable = Math.max(0, totalPkgCost - calculatedSubsidy);
    const tenureMonths = 12;
    const monthlyEmi = Math.round(netPayable / tenureMonths);

    const newBill: Bill = {
      id: `bill-${newId}`,
      request_id: newId,
      customer_id: custId,
      customer_name: custName,
      package_name: newRequest.package_name,
      capacity_kw: data.capacityKw,
      total_amount: totalPkgCost,
      subsidy_amount: calculatedSubsidy,
      net_payable: netPayable,
      emi_tenure_months: tenureMonths,
      emi_monthly_amount: monthlyEmi,
      status: 'unpaid',
      created_at: new Date().toISOString(),
    };

    const newEmis: EmiSchedule[] = Array.from({ length: tenureMonths }, (_, i) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        id: `emi-${newId}-${i + 1}`,
        bill_id: newBill.id,
        installment_number: i + 1,
        amount: monthlyEmi,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
      };
    });

    setInstallations(prev => [newRequest, ...prev]);
    setStages(prev => ({ ...prev, [newId]: requestStages }));
    setSubsidies(prev => [newSubsidy, ...prev]);
    setBills(prev => [newBill, ...prev]);
    setEmis(prev => [...newEmis, ...prev]);

    return newRequest;
  };

  // Update Installation Status (Admin & Technician)
  const updateInstallationStatus = async (
    requestId: string,
    updates: {
      status?: InstallationStatus;
      scheduledDate?: string;
      assignedTechnicianId?: string;
      estimatedCompletionDate?: string;
      notes?: string;
    }
  ) => {
    let assignedTechName = undefined;
    let assignedTechPhone = undefined;
    if (updates.assignedTechnicianId) {
      const tech = profiles.find(p => p.id === updates.assignedTechnicianId);
      if (tech) {
        assignedTechName = tech.full_name;
        assignedTechPhone = tech.phone;
      }
    }

    setInstallations(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          ...updates,
          assigned_technician_name: assignedTechName !== undefined ? assignedTechName : req.assigned_technician_name,
          assigned_technician_phone: assignedTechPhone !== undefined ? assignedTechPhone : req.assigned_technician_phone,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  // Update 7-Stage Progress (Technician & Admin)
  const updateStageStatus = async (
    requestId: string,
    stageNumber: number,
    status: StageStatus,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    const updaterName = currentUser?.full_name || 'Assigned Technician';

    setStages(prev => {
      const reqStages = prev[requestId] ? [...prev[requestId]] : INITIAL_STAGES_TEMPLATE(requestId);
      const updated = reqStages.map(st => {
        if (st.stage_number === stageNumber) {
          return {
            ...st,
            status,
            technician_notes: notes !== undefined ? notes : st.technician_notes,
            updated_by_name: updaterName,
            completed_at: status === 'completed' ? (st.completed_at || now) : undefined,
            updated_at: now,
          };
        }
        return st;
      });
      return { ...prev, [requestId]: updated };
    });

    // Automatically update the request's current_stage if completed
    setInstallations(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        let newCurrentStage = req.current_stage;
        let newReqStatus = req.status;

        if (status === 'completed' && stageNumber >= req.current_stage) {
          newCurrentStage = Math.min(7, stageNumber + 1);
        }
        if (stageNumber === 7 && status === 'completed') {
          newReqStatus = 'completed';
        } else if (newReqStatus === 'pending_review' || newReqStatus === 'scheduled') {
          newReqStatus = 'in_progress';
        }

        return {
          ...req,
          current_stage: newCurrentStage,
          status: newReqStatus,
          updated_at: now,
        };
      })
    );
  };

  // Solar Packages Management (Admin)
  const createPackage = async (pkg: Omit<SolarPackage, 'id'>) => {
    const newPkg: SolarPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setPackages(prev => [...prev, newPkg]);
  };

  const updatePackage = async (id: string, updates: Partial<SolarPackage>) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteOrDeactivatePackage = async (id: string) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, is_active: false } : p)));
  };

  // Bill Generation with Configurable Subsidy & EMI (Admin)
  const generateBill = async (
    requestId: string,
    totalAmount: number,
    subsidyAmount: number,
    emiTenureMonths: number
  ): Promise<Bill> => {
    const req = installations.find(r => r.id === requestId);
    const netPayable = Math.max(0, totalAmount - subsidyAmount);
    const monthlyEmi = Math.round(netPayable / emiTenureMonths);
    const billId = `bill-${requestId}-${Date.now().toString().slice(-4)}`;

    const newBill: Bill = {
      id: billId,
      request_id: requestId,
      customer_id: req?.customer_id || 'cust-rahul-01',
      customer_name: req?.customer_name,
      package_name: req?.package_name,
      capacity_kw: req?.capacity_kw,
      total_amount: totalAmount,
      subsidy_amount: subsidyAmount,
      net_payable: netPayable,
      emi_tenure_months: emiTenureMonths,
      emi_monthly_amount: monthlyEmi,
      status: 'unpaid',
      created_at: new Date().toISOString(),
    };

    const newEmis: EmiSchedule[] = Array.from({ length: emiTenureMonths }, (_, i) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        id: `emi-${billId}-${i + 1}`,
        bill_id: billId,
        installment_number: i + 1,
        amount: monthlyEmi,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
      };
    });

    setBills(prev => [newBill, ...prev.filter(b => b.request_id !== requestId)]);
    setEmis(prev => [...newEmis, ...prev.filter(e => e.bill_id !== billId)]);

    return newBill;
  };

  // Simulated Demo Payment Execution
  const processDemoPayment = async (
    emiId: string,
    paymentMode: 'upi' | 'card' | 'netbanking'
  ): Promise<PaymentReceipt> => {
    const emi = emis.find(e => e.id === emiId);
    if (!emi) throw new Error('EMI installment not found');
    const bill = bills.find(b => b.id === emi.bill_id);
    const req = installations.find(r => r.id === bill?.request_id);

    const now = new Date().toISOString();
    const receiptId = `RCP-DEMO-${Date.now().toString().slice(-6)}`;
    const txnRef = `${paymentMode.toUpperCase()}-DEMO-${Date.now().toString().slice(-8)}`;

    // 1. Update EMI installment status
    setEmis(prev =>
      prev.map(e => {
        if (e.id === emiId) {
          return {
            ...e,
            status: 'paid',
            paid_at: now,
            payment_method: paymentMode,
            demo_receipt_id: receiptId,
          };
        }
        return e;
      })
    );

    // 2. Record demo payment
    const newPayment: DemoPayment = {
      id: `pay-${Date.now()}`,
      emi_id: emiId,
      bill_id: emi.bill_id,
      customer_id: currentUser?.id || bill?.customer_id || 'cust-rahul-01',
      customer_name: currentUser?.full_name || bill?.customer_name || 'Rahul Sharma',
      installment_number: emi.installment_number,
      amount: emi.amount,
      payment_mode: paymentMode,
      transaction_ref: txnRef,
      status: 'success',
      is_demo: true,
      notes: 'Simulated demo payment. No real money was charged.',
      created_at: now,
    };
    setPayments(prev => [newPayment, ...prev]);

    // 3. Update Bill status
    const remainingEmis = emis.filter(e => e.bill_id === emi.bill_id && e.id !== emiId);
    const allOthersPaid = remainingEmis.every(e => e.status === 'paid');
    setBills(prev =>
      prev.map(b => {
        if (b.id === emi.bill_id) {
          return {
            ...b,
            status: allOthersPaid ? 'fully_paid' : 'partially_paid',
          };
        }
        return b;
      })
    );

    // 4. Generate printable receipt
    const receipt: PaymentReceipt = {
      receipt_id: receiptId,
      transaction_ref: txnRef,
      payment_date: now,
      customer_name: currentUser?.full_name || bill?.customer_name || 'Rahul Sharma',
      customer_email: currentUser?.email || 'rahul.sharma@gmail.com',
      customer_phone: currentUser?.phone,
      address: currentUser?.address || req?.property_address,
      electricity_conn_no: req?.electricity_conn_no,
      bill_id: emi.bill_id,
      installment_number: emi.installment_number,
      amount_paid: emi.amount,
      payment_mode: paymentMode,
      is_demo: true,
      package_name: bill?.package_name,
      capacity_kw: bill?.capacity_kw,
    };

    setLatestReceipt(receipt);
    return receipt;
  };

  // Subsidy Application status update (Admin)
  const updateSubsidyStatus = async (
    applicationId: string,
    status: SubsidyStatus,
    notes?: string,
    bankRef?: string
  ) => {
    const now = new Date().toISOString();
    setSubsidies(prev =>
      prev.map(sub => {
        if (sub.id === applicationId) {
          return {
            ...sub,
            status,
            notes: notes !== undefined ? notes : sub.notes,
            bank_ref: bankRef !== undefined ? bankRef : sub.bank_ref,
            disbursed_date: status === 'disbursed' ? now.split('T')[0] : sub.disbursed_date,
            updated_at: now,
          };
        }
        return sub;
      })
    );
  };

  // Complaints
  const createComplaint = async (data: {
    requestId?: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    priority?: ComplaintPriority;
  }): Promise<Complaint> => {
    const newComplaint: Complaint = {
      id: `tck-${Date.now()}`,
      customer_id: currentUser?.id || 'cust-rahul-01',
      customer_name: currentUser?.full_name || 'Rahul Sharma',
      customer_phone: currentUser?.phone || '+91 98765 43210',
      request_id: data.requestId,
      ticket_number: `SOL-TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'medium',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setComplaints(prev => [newComplaint, ...prev]);
    return newComplaint;
  };

  const updateComplaint = async (
    complaintId: string,
    status: ComplaintStatus,
    resolutionNotes?: string,
    assignedTechId?: string
  ) => {
    const now = new Date().toISOString();
    let techName = undefined;
    if (assignedTechId) {
      const tech = profiles.find(p => p.id === assignedTechId);
      if (tech) techName = tech.full_name;
    }

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            resolution_notes: resolutionNotes !== undefined ? resolutionNotes : c.resolution_notes,
            assigned_technician_id: assignedTechId !== undefined ? assignedTechId : c.assigned_technician_id,
            assigned_technician_name: techName !== undefined ? techName : c.assigned_technician_name,
            resolved_at: status === 'resolved' || status === 'closed' ? now : c.resolved_at,
            updated_at: now,
          };
        }
        return c;
      })
    );
  };

  // CSV Export for Admin
  const exportToCsv = (type: 'installations' | 'payments' | 'overdue_emis') => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `solarops_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'installations') {
      headers = [
        'Request ID',
        'Customer Name',
        'Phone',
        'Package / Capacity',
        'Roof Type',
        'Electricity Conn No',
        'DISCOM',
        'Sanctioned Load (kW)',
        'Status',
        'Current Stage (1-7)',
        'Assigned Technician',
        'Scheduled Date',
        'Created At',
      ];
      rows = installations.map(i => [
        i.id,
        `"${i.customer_name || ''}"`,
        `"${i.customer_phone || ''}"`,
        `"${i.package_name || i.capacity_kw + ' kW'}"`,
        i.roof_type,
        i.electricity_conn_no,
        `"${i.discom_provider}"`,
        i.sanctioned_load_kw,
        i.status,
        i.current_stage,
        `"${i.assigned_technician_name || 'Unassigned'}"`,
        i.scheduled_date || 'Not set',
        i.created_at,
      ]);
    } else if (type === 'payments') {
      headers = [
        'Payment ID',
        'Transaction Ref',
        'Customer Name',
        'Bill ID',
        'Installment No',
        'Amount (INR)',
        'Payment Mode',
        'Status',
        'Demo Flag',
        'Date & Time',
      ];
      rows = payments.map(p => [
        p.id,
        p.transaction_ref,
        `"${p.customer_name || ''}"`,
        p.bill_id,
        p.installment_number || 1,
        p.amount,
        p.payment_mode.toUpperCase(),
        p.status,
        'DEMO_ONLY',
        p.created_at,
      ]);
    } else if (type === 'overdue_emis') {
      headers = [
        'EMI ID',
        'Bill ID',
        'Installment No',
        'Amount (INR)',
        'Due Date',
        'Status',
      ];
      rows = emis
        .filter(e => e.status === 'overdue' || (e.status === 'pending' && new Date(e.due_date) < new Date()))
        .map(e => [
          e.id,
          e.bill_id,
          e.installment_number,
          e.amount,
          e.due_date,
          'OVERDUE',
        ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Demo Store
  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}profiles`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}packages`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}installations`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}stages`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}bills`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}emis`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}payments`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}subsidies`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}complaints`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);

    setProfiles(DEMO_USERS);
    setPackages(INITIAL_PACKAGES);
    setInstallations(INITIAL_INSTALLATIONS);
    setStages({ 'req-solar-001': INITIAL_STAGES_TEMPLATE('req-solar-001') });
    setBills(INITIAL_BILLS);
    setEmis(INITIAL_EMIS);
    setPayments(INITIAL_DEMO_PAYMENTS);
    setSubsidies(INITIAL_SUBSIDIES);
    setComplaints(INITIAL_COMPLAINTS);
    setCurrentUser(DEMO_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        isSupabaseActive: isSupabaseConfigured,
        adminEmailConfig: ADMIN_EMAIL,
        profiles,
        packages,
        installations,
        stages,
        bills,
        emis,
        payments,
        subsidies,
        complaints,
        latestReceipt,
        setLatestReceipt,
        switchDemoRole,
        loginWithEmail,
        signUpWithEmail,
        logout,
        updateProfile,
        createInstallationRequest,
        updateInstallationStatus,
        updateStageStatus,
        createPackage,
        updatePackage,
        deleteOrDeactivatePackage,
        generateBill,
        processDemoPayment,
        updateSubsidyStatus,
        createComplaint,
        updateComplaint,
        exportToCsv,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
