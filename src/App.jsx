
import React, { useState, useRef, useEffect } from 'react';

// --- ROLES and Permissions ---
const ROLES = {
    F_I_PRODUCT_MANAGER: 'F&I Product Manager',
    CUSTOMER_SERVICE_REPRESENTATIVE: 'Customer Service Representative',
    DEALERSHIP_PORTAL_USER: 'Dealership Portal User',
    VEHICLE_OWNER: 'Vehicle Owner',
    SYSTEM_ARCHITECT: 'System Architect',
};

// Set the current user's role for this session (for RBAC simulation)
const USER_ROLE = ROLES.F_I_PRODUCT_MANAGER; // Change this to test different roles

const can = (permission) => {
    switch (USER_ROLE) {
        case ROLES.F_I_PRODUCT_MANAGER:
            return ['view_dashboard', 'view_contracts', 'manage_contracts', 'view_claims', 'manage_claims', 'view_renewals', 'manage_renewals', 'view_users', 'view_audit_logs', 'export_data'].includes(permission);
        case ROLES.CUSTOMER_SERVICE_REPRESENTATIVE:
            return ['view_dashboard', 'view_contracts', 'view_claims', 'manage_claims', 'view_renewals', 'manage_renewals', 'view_users'].includes(permission);
        case ROLES.DEALERSHIP_PORTAL_USER:
            return ['view_dashboard', 'view_contracts', 'create_contracts', 'view_claims', 'create_claims', 'view_renewals', 'export_data'].includes(permission);
        case ROLES.VEHICLE_OWNER:
            return ['view_dashboard', 'view_contracts', 'create_claims', 'request_renewals', 'request_cancellations'].includes(permission);
        case ROLES.SYSTEM_ARCHITECT:
            return ['view_dashboard', 'view_contracts', 'view_claims', 'view_renewals', 'view_users', 'view_audit_logs', 'manage_settings'].includes(permission);
        default:
            return false;
    }
};

// --- Status Configuration ---
const STATUS_CONFIG = {
    APPROVED: { label: 'Approved', colorVar: '--status-approved' },
    PENDING: { label: 'Pending', colorVar: '--status-pending' },
    REJECTED: { label: 'Rejected', colorVar: '--status-rejected' },
    IN_REVIEW: { label: 'In Review', colorVar: '--status-in-review' },
    CANCELLED: { label: 'Cancelled', colorVar: '--status-cancelled' },
    DRAFT: { label: 'Draft', colorVar: '--status-draft' },
    RENEWAL_DUE: { label: 'Renewal Due', colorVar: '--status-renewal-due' },
    UNDERWRITING: { label: 'Underwriting', colorVar: '--status-underwriting' },
    FRAUD_DETECTED: { label: 'Fraud Detected', colorVar: '--status-fraud-detected' },
    PROCESSED: { label: 'Processed', colorVar: '--status-processed' },
};

// --- Dummy Data ---
const dummyData = {
    contracts: [
        { id: 'VSC001', title: 'Luxury Sedan 36/36K', customer: 'Alice Smith', vehicle: 'BMW 5 Series', status: 'APPROVED', startDate: '2023-01-15', endDate: '2026-01-15', plan: 'Gold Plus', price: 3500, dealer: 'Prestige Motors', nextRenewal: '2025-01-15', auditLogs: [{ timestamp: '2023-01-15', user: 'System', action: 'Contract Initiated' }, { timestamp: '2023-01-16', user: 'Underwriter', action: 'Underwriting Review Complete' }, { timestamp: '2023-01-17', user: 'F&I Manager', action: 'Contract Approved' }] },
        { id: 'VSC002', title: 'Compact SUV 60/75K', customer: 'Bob Johnson', vehicle: 'Honda CR-V', status: 'PENDING', startDate: '2023-03-01', endDate: '2028-03-01', plan: 'Silver', price: 2800, dealer: 'Honda City', nextRenewal: '2027-03-01', auditLogs: [{ timestamp: '2023-03-01', user: 'Dealer User', action: 'Contract Drafted' }, { timestamp: '2023-03-02', user: 'System', action: 'Automated Fraud Check Initiated' }] },
        { id: 'VSC003', title: 'Electric Hatchback 48/50K', customer: 'Charlie Brown', vehicle: 'Tesla Model 3', status: 'IN_REVIEW', startDate: '2023-02-10', endDate: '2027-02-10', plan: 'Platinum', price: 4200, dealer: 'EV Solutions', nextRenewal: '2026-02-10', auditLogs: [{ timestamp: '2023-02-10', user: 'Dealer User', action: 'Contract Submitted for Approval' }, { timestamp: '2023-02-11', user: 'F&I Manager', action: 'Manual Review Initiated' }] },
        { id: 'VSC004', title: 'Family Minivan 36/45K', customer: 'Diana Prince', vehicle: 'Toyota Sienna', status: 'REJECTED', startDate: '2023-04-05', endDate: '2026-04-05', plan: 'Bronze', price: 2100, dealer: 'Family Autos', nextRenewal: '2025-04-05', auditLogs: [{ timestamp: '2023-04-05', user: 'Dealer User', action: 'Contract Submitted' }, { timestamp: '2023-04-06', user: 'Underwriter', action: 'Contract Rejected (High Risk)' }] },
        { id: 'VSC005', title: 'Sports Coupe 24/24K', customer: 'Eve Adams', vehicle: 'Porsche 911', status: 'APPROVED', startDate: '2022-11-20', endDate: '2024-11-20', plan: 'Elite', price: 6000, dealer: 'Luxury Motors', nextRenewal: '2023-11-20', auditLogs: [{ timestamp: '2022-11-20', user: 'System', action: 'Contract Created' }, { timestamp: '2022-11-21', user: 'F&I Manager', action: 'Contract Approved' }] },
        { id: 'VSC006', title: 'Pickup Truck 72/100K', customer: 'Frank Miller', vehicle: 'Ford F-150', status: 'RENEWAL_DUE', startDate: '2021-06-01', endDate: '2024-06-01', plan: 'Heavy Duty', price: 4500, dealer: 'Truck World', nextRenewal: '2024-06-01', auditLogs: [{ timestamp: '2021-06-01', user: 'System', action: 'Contract Initiated' }, { timestamp: '2024-05-01', user: 'System', action: 'Renewal Notification Sent' }] },
        { id: 'VSC007', title: 'Crossover 48/60K', customer: 'Grace Lee', vehicle: 'Kia Seltos', status: 'DRAFT', startDate: '2024-01-10', endDate: '2028-01-10', plan: 'Standard', price: 2500, dealer: 'Economy Cars', nextRenewal: '2027-01-10', auditLogs: [{ timestamp: '2024-01-10', user: 'Dealer User', action: 'Contract Drafted' }] },
    ],
    claims: [
        { id: 'CLM001', contractId: 'VSC001', description: 'Engine knocking noise', vehicle: 'BMW 5 Series', status: 'PENDING', submittedDate: '2023-05-20', estimatedCost: 1200, actualCost: null, resolution: null, auditLogs: [{ timestamp: '2023-05-20', user: 'Vehicle Owner', action: 'Claim Filed' }] },
        { id: 'CLM002', contractId: 'VSC003', description: 'Brake system malfunction', vehicle: 'Tesla Model 3', status: 'APPROVED', submittedDate: '2023-04-10', estimatedCost: 800, actualCost: 750, resolution: 'Repairs completed', auditLogs: [{ timestamp: '2023-04-10', user: 'Vehicle Owner', action: 'Claim Filed' }, { timestamp: '2023-04-12', user: 'Customer Service Rep', action: 'Claim Reviewed' }, { timestamp: '2023-04-15', user: 'System', action: 'Claim Approved' }] },
        { id: 'CLM003', contractId: 'VSC005', description: 'Transmission issues', vehicle: 'Porsche 911', status: 'REJECTED', submittedDate: '2023-06-01', estimatedCost: 3000, actualCost: null, resolution: 'Not covered under contract terms', auditLogs: [{ timestamp: '2023-06-01', user: 'Vehicle Owner', action: 'Claim Filed' }, { timestamp: '2023-06-03', user: 'F&I Manager', action: 'Claim Rejected' }] },
        { id: 'CLM004', contractId: 'VSC002', description: 'AC Compressor failure', vehicle: 'Honda CR-V', status: 'IN_REVIEW', submittedDate: '2023-07-15', estimatedCost: 950, actualCost: null, resolution: null, auditLogs: [{ timestamp: '2023-07-15', user: 'Dealership Portal User', action: 'Claim Submitted' }, { timestamp: '2023-07-16', user: 'AI System', action: 'Fraud Detection Scan' }] },
        { id: 'CLM005', contractId: 'VSC001', description: 'Power window motor replacement', vehicle: 'BMW 5 Series', status: 'PROCESSED', submittedDate: '2023-02-28', estimatedCost: 400, actualCost: 380, resolution: 'Service completed and reimbursed', auditLogs: [{ timestamp: '2023-02-28', user: 'Vehicle Owner', action: 'Claim Filed' }, { timestamp: '2023-03-01', user: 'System', action: 'Claim Auto-Approved' }, { timestamp: '2023-03-05', user: 'System', action: 'Reimbursement Processed' }] },
    ],
    renewals: [
        { id: 'REN001', contractId: 'VSC005', customer: 'Eve Adams', vehicle: 'Porsche 911', status: 'PENDING', dueDate: '2023-11-20', proposedPlan: 'Elite Plus', proposedPrice: 6500, auditLogs: [{ timestamp: '2023-10-20', user: 'System', action: 'Renewal Offer Generated' }] },
        { id: 'REN002', contractId: 'VSC006', customer: 'Frank Miller', vehicle: 'Ford F-150', status: 'RENEWAL_DUE', dueDate: '2024-06-01', proposedPlan: 'Heavy Duty 2.0', proposedPrice: 5000, auditLogs: [{ timestamp: '2024-05-01', user: 'System', action: 'Renewal Notification Sent' }] },
        { id: 'REN003', contractId: 'VSC001', customer: 'Alice Smith', vehicle: 'BMW 5 Series', status: 'APPROVED', dueDate: '2025-01-15', proposedPlan: 'Gold Plus Extended', proposedPrice: 4000, auditLogs: [{ timestamp: '2024-12-15', user: 'System', action: 'Renewal Offer Generated' }, { timestamp: '2024-12-20', user: 'Vehicle Owner', action: 'Renewal Accepted' }] },
        { id: 'REN004', contractId: 'VSC004', customer: 'Diana Prince', vehicle: 'Toyota Sienna', status: 'CANCELLED', dueDate: '2025-04-05', proposedPlan: 'Bronze Extended', proposedPrice: 2500, auditLogs: [{ timestamp: '2025-03-05', user: 'System', action: 'Renewal Offer Generated' }, { timestamp: '2025-03-10', user: 'Vehicle Owner', action: 'Renewal Declined' }] },
    ],
    users: [
        { id: 'USR001', name: 'Alice Smith', role: 'Vehicle Owner', email: 'alice.s@example.com', registrationDate: '2023-01-10', status: 'ACTIVE', lastLogin: '2024-05-20' },
        { id: 'USR002', name: 'Bob Johnson', role: 'Vehicle Owner', email: 'bob.j@example.com', registrationDate: '2023-02-25', status: 'ACTIVE', lastLogin: '2024-05-18' },
        { id: 'USR003', name: 'Carol White', role: 'F&I Product Manager', email: 'carol.w@example.com', registrationDate: '2022-10-01', status: 'ACTIVE', lastLogin: '2024-05-21' },
        { id: 'USR004', name: 'David Green', role: 'Customer Service Representative', email: 'david.g@example.com', registrationDate: '2023-01-05', status: 'ACTIVE', lastLogin: '2024-05-21' },
        { id: 'USR005', name: 'Emily Black', role: 'Dealership Portal User', email: 'emily.b@example.com', registrationDate: '2023-03-15', status: 'ACTIVE', lastLogin: '2024-05-19' },
        { id: 'USR006', name: 'Frank System', role: 'System Architect', email: 'frank.s@example.com', registrationDate: '2022-09-01', status: 'ACTIVE', lastLogin: '2024-05-21' },
    ]
};

const getBreadcrumbs = (screen, params) => {
    let path = [];
    switch (screen) {
        case 'DASHBOARD':
            path.push('Dashboard');
            break;
        case 'CONTRACTS_LIST':
            path.push('Dashboard', 'VSC Contracts');
            break;
        case 'CONTRACT_DETAIL':
            path.push('Dashboard', 'VSC Contracts', `Contract ${params?.id}`);
            break;
        case 'CLAIMS_LIST':
            path.push('Dashboard', 'Claims');
            break;
        case 'CLAIM_DETAIL':
            path.push('Dashboard', 'Claims', `Claim ${params?.id}`);
            break;
        case 'RENEWALS_LIST':
            path.push('Dashboard', 'Renewals');
            break;
        case 'RENEWAL_DETAIL':
            path.push('Dashboard', 'Renewals', `Renewal ${params?.id}`);
            break;
        case 'USERS_LIST':
            path.push('Dashboard', 'Users');
            break;
        case 'USER_DETAIL':
            path.push('Dashboard', 'Users', `User ${params?.id}`);
            break;
        default:
            path.push('Dashboard');
    }
    return path;
};

// --- Reusable Components ---

const Card = ({ title, meta, description, status, onClick, children, actions }) => (
    <div
        className={`card status-${status || 'DRAFT'}`}
        style={{ marginBottom: 'var(--spacing-md)' }}
        onClick={onClick}
    >
        <h3 className="card-title">{title}</h3>
        {meta && <p className="card-meta">{meta}</p>}
        {description && <p className="card-description">{description}</p>}
        <div className="card-footer">
            <span className={`status-badge status-${status || 'DRAFT'}`} style={{ backgroundColor: `var(${STATUS_CONFIG[status]?.colorVar || STATUS_CONFIG['DRAFT'].colorVar})` }}>
                {STATUS_CONFIG[status]?.label || STATUS_CONFIG['DRAFT'].label}
            </span>
            {children}
            {actions && <div className="card-actions">{actions}</div>}
        </div>
    </div>
);

const Button = ({ children, onClick, type = 'primary', disabled = false }) => (
    <button
        className={`button button-${type}`}
        onClick={onClick}
        disabled={disabled}
        style={{ marginRight: 'var(--spacing-xs)' }}
    >
        {children}
    </button>
);

const EmptyState = ({ title, description, buttonText, onButtonClick }) => (
    <div className="empty-state">
        <h3>{title}</h3>
        <p>{description}</p>
        {buttonText && onButtonClick && (
            <Button onClick={onButtonClick} type="primary">{buttonText}</Button>
        )}
    </div>
);

const Breadcrumbs = ({ path, navigate }) => (
    <div className="breadcrumbs">
        {path.map((item, index) => (
            <React.Fragment key={item}>
                {index > 0 && <span>/</span>}
                {index < path.length - 1 ? (
                    <span onClick={() => navigate(item.replace(' ', '_').toUpperCase() + '_LIST')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{item}</span>
                ) : (
                    <span>{item}</span>
                )}
            </React.Fragment>
        ))}
    </div>
);

// --- Page Components ---

const Dashboard = ({ navigate }) => {
    const totalContracts = dummyData.contracts.length;
    const pendingClaims = dummyData.claims.filter(c => c.status === 'PENDING').length;
    const renewalsDue = dummyData.renewals.filter(r => r.status === 'RENEWAL_DUE').length;

    const contractStatusData = dummyData.contracts.reduce((acc, contract) => {
        acc[contract.status] = (acc[contract.status] || 0) + 1;
        return acc;
    }, {});
    const contractStatusPercentages = Object.entries(contractStatusData).map(([status, count]) => ({
        status,
        percentage: ((count / totalContracts) * 100).toFixed(1)
    }));

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                {can('create_contracts') && <Button onClick={() => console.log('Create New Contract')}>+ New Contract</Button>}
            </div>

            <div className="dashboard-grid">
                {can('view_contracts') && (
                    <Card
                        title="Total VSC Contracts"
                        meta={`${totalContracts} contracts`}
                        description="Overview of all active and inactive vehicle service contracts."
                        status="APPROVED" // Aesthetic color for dashboard card
                        onClick={() => navigate('CONTRACTS_LIST')}
                    >
                        <div className="chart-placeholder pulse" style={{ marginTop: 'var(--spacing-sm)' }}>
                            <p>Bar Chart: Status Distribution</p>
                            <div style={{
                                display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', padding: 'var(--spacing-xs)'
                            }}>
                                {contractStatusPercentages.map((item) => (
                                    <div key={item.status} style={{
                                        width: '15%', height: `${item.percentage}%`,
                                        backgroundColor: `var(${STATUS_CONFIG[item.status]?.colorVar || '--primary-color'})`,
                                        borderRadius: 'var(--border-radius-sm)',
                                        margin: '0 2%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 'var(--font-size-xs)', color: 'white'
                                    }} title={`${STATUS_CONFIG[item.status]?.label}: ${item.percentage}%`}>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {can('view_claims') && (
                    <Card
                        title="Pending Claims"
                        meta={`${pendingClaims} claims need attention`}
                        description="Claims awaiting review or approval."
                        status="PENDING"
                        onClick={() => navigate('CLAIMS_LIST')}
                    >
                        <div className="chart-placeholder pulse" style={{ marginTop: 'var(--spacing-sm)' }}>
                            <p>Gauge Chart: Approval Rate (75%)</p>
                            <div style={{
                                width: '100px', height: '50px', borderRadius: '50px 50px 0 0', overflow: 'hidden',
                                position: 'relative', top: '25px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                                background: 'linear-gradient(to right, var(--success-color) 75%, var(--border-color) 75%)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color)' }}>75%</span>
                            </div>
                        </div>
                    </Card>
                )}

                {can('view_renewals') && (
                    <Card
                        title="Renewals Due"
                        meta={`${renewalsDue} contracts soon to expire`}
                        description="Contracts that require renewal action in the near future."
                        status="RENEWAL_DUE"
                        onClick={() => navigate('RENEWALS_LIST')}
                    >
                        <div className="chart-placeholder pulse" style={{ marginTop: 'var(--spacing-sm)' }}>
                            <p>Line Chart: Upcoming Renewals Trend</p>
                            <div style={{
                                width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                                padding: 'var(--spacing-xs)', borderBottom: '1px solid var(--text-color-light)'
                            }}>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, i) => (
                                    <div key={month} style={{
                                        height: `${Math.random() * 80 + 20}%`, width: '10px',
                                        backgroundColor: 'var(--primary-color-light)', borderRadius: 'var(--border-radius-sm)'
                                    }}></div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {(can('view_contracts') || can('view_claims') || can('view_renewals')) && (
                    <div className="card recent-activities-card">
                        <h3 className="card-title">Recent Activities</h3>
                        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                            <ul className="list-group">
                                <li className="activity-item">
                                    <div className="activity-item-details">
                                        <div className="activity-item-title">Contract VSC001 Approved</div>
                                        <div className="activity-item-meta">by F&I Manager, 5 mins ago</div>
                                    </div>
                                    <span className={`status-badge status-APPROVED`} style={{ backgroundColor: `var(${STATUS_CONFIG['APPROVED'].colorVar})` }}>Approved</span>
                                </li>
                                <li className="activity-item">
                                    <div className="activity-item-details">
                                        <div className="activity-item-title">Claim CLM004 Submitted</div>
                                        <div className="activity-item-meta">by Dealership Portal User, 1 hour ago</div>
                                    </div>
                                    <span className={`status-badge status-IN_REVIEW`} style={{ backgroundColor: `var(${STATUS_CONFIG['IN_REVIEW'].colorVar})` }}>In Review</span>
                                </li>
                                <li className="activity-item">
                                    <div className="activity-item-details">
                                        <div className="activity-item-title">Renewal REN002 Due Soon</div>
                                        <div className="activity-item-meta">System notification, 3 hours ago</div>
                                    </div>
                                    <span className={`status-badge status-RENEWAL_DUE`} style={{ backgroundColor: `var(${STATUS_CONFIG['RENEWAL_DUE'].colorVar})` }}>Renewal Due</span>
                                </li>
                                <li className="activity-item">
                                    <div className="activity-item-details">
                                        <div className="activity-item-title">Contract VSC007 Drafted</div>
                                        <div className="activity-item-meta">by Dealer User, Yesterday</div>
                                    </div>
                                    <span className={`status-badge status-DRAFT`} style={{ backgroundColor: `var(${STATUS_CONFIG['DRAFT'].colorVar})` }}>Draft</span>
                                </li>
                            </ul>
                        </div>
                        <Button type="secondary" onClick={() => console.log('View all activities')}>View All</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ContractsList = ({ navigate }) => {
    const contracts = dummyData.contracts;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredContracts = contracts.filter(contract =>
        (contract?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         contract?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         contract?.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         contract?.id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'ALL' || contract?.status === filterStatus)
    );

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    if (!can('view_contracts')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Access Denied"
                    description="You do not have permission to view VSC Contracts."
                    buttonText="Back to Dashboard"
                    onButtonClick={() => navigate('DASHBOARD')}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('CONTRACTS_LIST')} navigate={navigate} />
            <div className="page-header">
                <h1 className="page-title">VSC Contracts</h1>
                {can('create_contracts') && <Button onClick={() => console.log('Open Create Contract Form')}>+ Create Contract</Button>}
            </div>

            <div className="list-controls">
                <input
                    type="text"
                    placeholder="Search contracts..."
                    className="list-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="button button-secondary" onChange={handleFilterChange} value={filterStatus}>
                    <option value="ALL">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map(status => (
                        <option key={status} value={status}>{STATUS_CONFIG[status]?.label}</option>
                    ))}
                </select>
                <Button type="secondary" onClick={() => console.log('Open Filter Panel')}>Filter</Button>
                <Button type="secondary" onClick={() => console.log('Export Contracts')}>Export to Excel/PDF</Button>
            </div>

            {filteredContracts.length === 0 ? (
                <EmptyState
                    title="No Contracts Found"
                    description="Adjust your search or filters, or create a new contract."
                    buttonText="Create New Contract"
                    onButtonClick={() => console.log('Open Create Contract Form')}
                />
            ) : (
                <div className="card-grid">
                    {filteredContracts.map(contract => (
                        <Card
                            key={contract?.id}
                            title={contract?.title}
                            meta={`Customer: ${contract?.customer} | Vehicle: ${contract?.vehicle}`}
                            description={`Plan: ${contract?.plan}, Dealer: ${contract?.dealer}`}
                            status={contract?.status}
                            onClick={() => navigate('CONTRACT_DETAIL', { id: contract?.id })}
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color-light)' }}>
                                End Date: {contract?.endDate}
                            </span>
                            {(can('manage_contracts') || can('create_claims')) && (
                                <div className="card-actions">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); console.log(`Quick action edit for ${contract?.id}`); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginLeft: 'var(--spacing-xs)' }}
                                    >Edit</button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContractDetail = ({ navigate, params }) => {
    const contract = dummyData.contracts.find(c => c.id === params?.id);
    const relatedClaims = dummyData.claims.filter(c => c.contractId === params?.id);

    const handleApprove = () => { console.log(`Approved Contract ${contract?.id}`); };
    const handleReject = () => { console.log(`Rejected Contract ${contract?.id}`); };
    const handleEdit = () => { console.log(`Editing Contract ${contract?.id}`); };
    const handleCancel = () => { console.log(`Cancelled Contract ${contract?.id}`); };
    const handleRenew = () => { console.log(`Renewing Contract ${contract?.id}`); };

    if (!contract || !can('view_contracts')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Contract Not Found or Access Denied"
                    description="The requested contract does not exist or you do not have permission to view it."
                    buttonText="Back to Contracts"
                    onButtonClick={() => navigate('CONTRACTS_LIST')}
                />
            </div>
        );
    }

    const workflowStages = [
        { name: 'Initiated', completed: true },
        { name: 'Underwriting', completed: contract.status !== 'DRAFT' },
        { name: 'Fraud Check', completed: contract.status !== 'DRAFT' && contract.status !== 'PENDING' },
        { name: 'Approved/Rejected', active: contract.status === 'APPROVED' || contract.status === 'REJECTED', completed: contract.status === 'APPROVED' || contract.status === 'REJECTED' },
        { name: 'Active', active: contract.status === 'APPROVED' },
    ];

    const currentWorkflowStageIndex = workflowStages.findIndex(stage => stage.active);
    const hasSLAbreach = (contract.status === 'PENDING' && new Date(contract.startDate) < new Date('2023-03-01')); // Simulate a past date for SLA

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('CONTRACT_DETAIL', params)} navigate={navigate} />
            <div className="detail-page-container">
                <div className="detail-header">
                    <h1 className="detail-title">{contract?.title}</h1>
                    <div className="detail-actions">
                        {can('manage_contracts') && contract?.status === 'PENDING' && (
                            <Button onClick={handleApprove} type="success">Approve</Button>
                        )}
                        {can('manage_contracts') && contract?.status === 'PENDING' && (
                            <Button onClick={handleReject} type="danger">Reject</Button>
                        )}
                        {can('manage_contracts') && (contract?.status === 'DRAFT' || contract?.status === 'IN_REVIEW') && (
                            <Button onClick={handleEdit} type="secondary">Edit</Button>
                        )}
                        {(can('manage_contracts') || can('request_cancellations')) && contract?.status === 'APPROVED' && (
                            <Button onClick={handleCancel} type="danger">Cancel Contract</Button>
                        )}
                        {(can('manage_contracts') || can('request_renewals')) && contract?.status === 'RENEWAL_DUE' && (
                            <Button onClick={handleRenew} type="primary">Renew Contract</Button>
                        )}
                        <span className={`status-badge status-${contract?.status}`} style={{ backgroundColor: `var(${STATUS_CONFIG[contract?.status]?.colorVar})` }}>
                            {STATUS_CONFIG[contract?.status]?.label}
                        </span>
                    </div>
                </div>

                <div className="workflow-tracker">
                    {workflowStages.map((stage, index) => (
                        <div key={index} className={`workflow-stage ${stage.completed ? 'completed' : ''} ${stage.active ? 'active' : ''} ${(hasSLAbreach && stage.name === 'Underwriting') ? 'sla-breach' : ''}`}>
                            <div className={`workflow-stage-icon`}>
                                {stage.completed ? '✓' : (stage.active ? '•' : (hasSLAbreach && stage.name === 'Underwriting' ? '!' : String.fromCharCode(65 + index)))}
                            </div>
                            <span className={`workflow-stage-name`}>{stage.name}</span>
                        </div>
                    ))}
                </div>

                <div className="detail-section">
                    <h2 className="detail-section-title">Contract Details</h2>
                    <div className="detail-item"><strong>Contract ID:</strong><span>{contract?.id}</span></div>
                    <div className="detail-item"><strong>Customer:</strong><span>{contract?.customer}</span></div>
                    <div className="detail-item"><strong>Vehicle:</strong><span>{contract?.vehicle}</span></div>
                    <div className="detail-item"><strong>Plan:</strong><span>{contract?.plan}</span></div>
                    <div className="detail-item"><strong>Dealer:</strong><span>{contract?.dealer}</span></div>
                    <div className="detail-item"><strong>Start Date:</strong><span>{contract?.startDate}</span></div>
                    <div className="detail-item"><strong>End Date:</strong><span>{contract?.endDate}</span></div>
                    <div className="detail-item"><strong>Price:</strong><span>${contract?.price?.toLocaleString()}</span></div>
                    <div className="detail-item"><strong>Next Renewal:</strong><span>{contract?.nextRenewal || 'N/A'}</span></div>
                </div>

                {can('view_claims') && relatedClaims.length > 0 && (
                    <div className="detail-section">
                        <h2 className="detail-section-title">Related Claims</h2>
                        <ul className="list-group">
                            {relatedClaims.map(claim => (
                                <li key={claim?.id} className="list-group-item" onClick={() => navigate('CLAIM_DETAIL', { id: claim?.id })} style={{ cursor: 'pointer' }}>
                                    <span className="label">Claim {claim?.id}:</span>
                                    <span className="value">{claim?.description}</span>
                                    <span className={`status-badge status-${claim?.status}`} style={{ backgroundColor: `var(${STATUS_CONFIG[claim?.status]?.colorVar})` }}>
                                        {STATUS_CONFIG[claim?.status]?.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Button type="secondary" onClick={() => navigate('CLAIMS_LIST', { contractId: contract?.id })} style={{ marginTop: 'var(--spacing-md)' }}>View All Related Claims</Button>
                    </div>
                )}

                {can('view_audit_logs') && (
                    <div className="detail-section">
                        <h2 className="detail-section-title">Audit Logs</h2>
                        <ul className="list-group">
                            {contract?.auditLogs?.map((log, index) => (
                                <li key={index} className="list-group-item">
                                    <span className="label">{log?.timestamp}:</span>
                                    <span className="value">{log?.action} by {log?.user}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const ClaimsList = ({ navigate }) => {
    const claims = dummyData.claims;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredClaims = claims.filter(claim =>
        (claim?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         claim?.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         claim?.contractId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         claim?.id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'ALL' || claim?.status === filterStatus)
    );

    if (!can('view_claims')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Access Denied"
                    description="You do not have permission to view Claims."
                    buttonText="Back to Dashboard"
                    onButtonClick={() => navigate('DASHBOARD')}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('CLAIMS_LIST')} navigate={navigate} />
            <div className="page-header">
                <h1 className="page-title">Claims</h1>
                {can('create_claims') && <Button onClick={() => console.log('Open Create Claim Form')}>+ File New Claim</Button>}
            </div>
            <div className="list-controls">
                <input
                    type="text"
                    placeholder="Search claims..."
                    className="list-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="button button-secondary" onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value="ALL">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map(status => (
                        <option key={status} value={status}>{STATUS_CONFIG[status]?.label}</option>
                    ))}
                </select>
                <Button type="secondary" onClick={() => console.log('Open Filter Panel')}>Filter</Button>
                <Button type="secondary" onClick={() => console.log('Export Claims')}>Export to Excel/PDF</Button>
            </div>
            {filteredClaims.length === 0 ? (
                <EmptyState
                    title="No Claims Found"
                    description="Adjust your search or filters, or file a new claim."
                    buttonText="File New Claim"
                    onButtonClick={() => console.log('Open Create Claim Form')}
                />
            ) : (
                <div className="card-grid">
                    {filteredClaims.map(claim => (
                        <Card
                            key={claim?.id}
                            title={`Claim: ${claim?.id}`}
                            meta={`Contract: ${claim?.contractId} | Vehicle: ${claim?.vehicle}`}
                            description={claim?.description}
                            status={claim?.status}
                            onClick={() => navigate('CLAIM_DETAIL', { id: claim?.id })}
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color-light)' }}>
                                Submitted: {claim?.submittedDate}
                            </span>
                            {can('manage_claims') && claim?.status === 'PENDING' && (
                                <div className="card-actions">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); console.log(`Approve claim ${claim?.id}`); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer', marginLeft: 'var(--spacing-xs)' }}
                                    >Approve</button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const ClaimDetail = ({ navigate, params }) => {
    const claim = dummyData.claims.find(c => c.id === params?.id);

    const handleApprove = () => { console.log(`Approved Claim ${claim?.id}`); };
    const handleReject = () => { console.log(`Rejected Claim ${claim?.id}`); };
    const handleEdit = () => { console.log(`Editing Claim ${claim?.id}`); };

    if (!claim || !can('view_claims')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Claim Not Found or Access Denied"
                    description="The requested claim does not exist or you do not have permission to view it."
                    buttonText="Back to Claims"
                    onButtonClick={() => navigate('CLAIMS_LIST')}
                />
            </div>
        );
    }

    const workflowStages = [
        { name: 'Filed', completed: true },
        { name: 'Review', active: claim.status === 'PENDING' || claim.status === 'IN_REVIEW', completed: claim.status !== 'DRAFT' },
        { name: 'AI Fraud Check', completed: claim.status !== 'PENDING' && claim.status !== 'IN_REVIEW' },
        { name: 'Adjudication', active: claim.status === 'APPROVED' || claim.status === 'REJECTED' || claim.status === 'PROCESSED', completed: claim.status === 'APPROVED' || claim.status === 'REJECTED' || claim.status === 'PROCESSED' },
        { name: 'Resolution', completed: claim.status === 'PROCESSED' },
    ];
    const hasSLAbreach = (claim.status === 'PENDING' && new Date(claim.submittedDate) < new Date('2023-06-01')); // Simulate a past date for SLA

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('CLAIM_DETAIL', params)} navigate={navigate} />
            <div className="detail-page-container">
                <div className="detail-header">
                    <h1 className="detail-title">Claim {claim?.id}</h1>
                    <div className="detail-actions">
                        {can('manage_claims') && claim?.status === 'PENDING' && (
                            <Button onClick={handleApprove} type="success">Approve Claim</Button>
                        )}
                        {can('manage_claims') && claim?.status === 'PENDING' && (
                            <Button onClick={handleReject} type="danger">Reject Claim</Button>
                        )}
                        {can('manage_claims') && (claim?.status === 'DRAFT' || claim?.status === 'IN_REVIEW') && (
                            <Button onClick={handleEdit} type="secondary">Edit Claim</Button>
                        )}
                        <span className={`status-badge status-${claim?.status}`} style={{ backgroundColor: `var(${STATUS_CONFIG[claim?.status]?.colorVar})` }}>
                            {STATUS_CONFIG[claim?.status]?.label}
                        </span>
                    </div>
                </div>

                <div className="workflow-tracker">
                    {workflowStages.map((stage, index) => (
                        <div key={index} className={`workflow-stage ${stage.completed ? 'completed' : ''} ${stage.active ? 'active' : ''} ${(hasSLAbreach && stage.name === 'Review') ? 'sla-breach' : ''}`}>
                            <div className={`workflow-stage-icon`}>
                                {stage.completed ? '✓' : (stage.active ? '•' : (hasSLAbreach && stage.name === 'Review' ? '!' : String.fromCharCode(65 + index)))}
                            </div>
                            <span className={`workflow-stage-name`}>{stage.name}</span>
                        </div>
                    ))}
                </div>

                <div className="detail-section">
                    <h2 className="detail-section-title">Claim Details</h2>
                    <div className="detail-item"><strong>Contract ID:</strong><span>{claim?.contractId}</span></div>
                    <div className="detail-item"><strong>Vehicle:</strong><span>{claim?.vehicle}</span></div>
                    <div className="detail-item"><strong>Description:</strong><span>{claim?.description}</span></div>
                    <div className="detail-item"><strong>Submitted Date:</strong><span>{claim?.submittedDate}</span></div>
                    <div className="detail-item"><strong>Estimated Cost:</strong><span>${claim?.estimatedCost?.toLocaleString()}</span></div>
                    <div className="detail-item"><strong>Actual Cost:</strong><span>{claim?.actualCost ? `$${claim?.actualCost?.toLocaleString()}` : 'N/A'}</span></div>
                    <div className="detail-item"><strong>Resolution:</strong><span>{claim?.resolution || 'Pending'}</span></div>
                </div>

                {can('view_audit_logs') && (
                    <div className="detail-section">
                        <h2 className="detail-section-title">Audit Logs</h2>
                        <ul className="list-group">
                            {claim?.auditLogs?.map((log, index) => (
                                <li key={index} className="list-group-item">
                                    <span className="label">{log?.timestamp}:</span>
                                    <span className="value">{log?.action} by {log?.user}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const RenewalsList = ({ navigate }) => {
    const renewals = dummyData.renewals;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredRenewals = renewals.filter(renewal =>
        (renewal?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         renewal?.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         renewal?.contractId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         renewal?.id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'ALL' || renewal?.status === filterStatus)
    );

    if (!can('view_renewals')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Access Denied"
                    description="You do not have permission to view Renewals."
                    buttonText="Back to Dashboard"
                    onButtonClick={() => navigate('DASHBOARD')}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('RENEWALS_LIST')} navigate={navigate} />
            <div className="page-header">
                <h1 className="page-title">Renewals</h1>
                {can('manage_renewals') && <Button onClick={() => console.log('Open Generate Renewal Offer Form')}>+ Generate New Offer</Button>}
            </div>
            <div className="list-controls">
                <input
                    type="text"
                    placeholder="Search renewals..."
                    className="list-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="button button-secondary" onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                    <option value="ALL">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map(status => (
                        <option key={status} value={status}>{STATUS_CONFIG[status]?.label}</option>
                    ))}
                </select>
                <Button type="secondary" onClick={() => console.log('Open Filter Panel')}>Filter</Button>
                <Button type="secondary" onClick={() => console.log('Export Renewals')}>Export to Excel/PDF</Button>
            </div>
            {filteredRenewals.length === 0 ? (
                <EmptyState
                    title="No Renewals Found"
                    description="Adjust your search or filters, or generate a new renewal offer."
                    buttonText="Generate New Offer"
                    onButtonClick={() => console.log('Open Generate Renewal Offer Form')}
                />
            ) : (
                <div className="card-grid">
                    {filteredRenewals.map(renewal => (
                        <Card
                            key={renewal?.id}
                            title={`Renewal: ${renewal?.id}`}
                            meta={`Contract: ${renewal?.contractId} | Customer: ${renewal?.customer}`}
                            description={`Vehicle: ${renewal?.vehicle}, Due Date: ${renewal?.dueDate}`}
                            status={renewal?.status}
                            onClick={() => navigate('RENEWAL_DETAIL', { id: renewal?.id })}
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color-light)' }}>
                                Proposed Plan: {renewal?.proposedPlan}
                            </span>
                            {can('manage_renewals') && renewal?.status === 'PENDING' && (
                                <div className="card-actions">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); console.log(`Accept renewal ${renewal?.id}`); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--success-color)', cursor: 'pointer', marginLeft: 'var(--spacing-xs)' }}
                                    >Accept</button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const RenewalDetail = ({ navigate, params }) => {
    const renewal = dummyData.renewals.find(r => r.id === params?.id);

    const handleApprove = () => { console.log(`Approved Renewal ${renewal?.id}`); };
    const handleReject = () => { console.log(`Rejected Renewal ${renewal?.id}`); };
    const handleSendReminder = () => { console.log(`Sent reminder for Renewal ${renewal?.id}`); };

    if (!renewal || !can('view_renewals')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Renewal Not Found or Access Denied"
                    description="The requested renewal does not exist or you do not have permission to view it."
                    buttonText="Back to Renewals"
                    onButtonClick={() => navigate('RENEWALS_LIST')}
                />
            </div>
        );
    }

    const workflowStages = [
        { name: 'Offer Generated', completed: true },
        { name: 'Customer Notified', active: renewal.status === 'PENDING' || renewal.status === 'RENEWAL_DUE', completed: renewal.status !== 'DRAFT' },
        { name: 'Response Awaited', active: renewal.status === 'PENDING' || renewal.status === 'RENEWAL_DUE' },
        { name: 'Actioned', completed: renewal.status === 'APPROVED' || renewal.status === 'CANCELLED' },
        { name: 'Contract Updated', completed: renewal.status === 'APPROVED' },
    ];
    const hasSLAbreach = (renewal.status === 'RENEWAL_DUE' && new Date(renewal.dueDate) < new Date('2024-06-01')); // Simulate a past date for SLA

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('RENEWAL_DETAIL', params)} navigate={navigate} />
            <div className="detail-page-container">
                <div className="detail-header">
                    <h1 className="detail-title">Renewal {renewal?.id}</h1>
                    <div className="detail-actions">
                        {can('manage_renewals') && renewal?.status === 'PENDING' && (
                            <Button onClick={handleApprove} type="success">Approve Renewal</Button>
                        )}
                        {can('manage_renewals') && renewal?.status === 'PENDING' && (
                            <Button onClick={handleReject} type="danger">Reject Renewal</Button>
                        )}
                        {can('manage_renewals') && renewal?.status === 'RENEWAL_DUE' && (
                            <Button onClick={handleSendReminder} type="primary">Send Reminder</Button>
                        )}
                        <span className={`status-badge status-${renewal?.status}`} style={{ backgroundColor: `var(${STATUS_CONFIG[renewal?.status]?.colorVar})` }}>
                            {STATUS_CONFIG[renewal?.status]?.label}
                        </span>
                    </div>
                </div>

                <div className="workflow-tracker">
                    {workflowStages.map((stage, index) => (
                        <div key={index} className={`workflow-stage ${stage.completed ? 'completed' : ''} ${stage.active ? 'active' : ''} ${(hasSLAbreach && stage.name === 'Response Awaited') ? 'sla-breach' : ''}`}>
                            <div className={`workflow-stage-icon`}>
                                {stage.completed ? '✓' : (stage.active ? '•' : (hasSLAbreach && stage.name === 'Response Awaited' ? '!' : String.fromCharCode(65 + index)))}
                            </div>
                            <span className={`workflow-stage-name`}>{stage.name}</span>
                        </div>
                    ))}
                </div>

                <div className="detail-section">
                    <h2 className="detail-section-title">Renewal Details</h2>
                    <div className="detail-item"><strong>Contract ID:</strong><span>{renewal?.contractId}</span></div>
                    <div className="detail-item"><strong>Customer:</strong><span>{renewal?.customer}</span></div>
                    <div className="detail-item"><strong>Vehicle:</strong><span>{renewal?.vehicle}</span></div>
                    <div className="detail-item"><strong>Due Date:</strong><span>{renewal?.dueDate}</span></div>
                    <div className="detail-item"><strong>Proposed Plan:</strong><span>{renewal?.proposedPlan}</span></div>
                    <div className="detail-item"><strong>Proposed Price:</strong><span>${renewal?.proposedPrice?.toLocaleString()}</span></div>
                </div>

                {can('view_audit_logs') && (
                    <div className="detail-section">
                        <h2 className="detail-section-title">Audit Logs</h2>
                        <ul className="list-group">
                            {renewal?.auditLogs?.map((log, index) => (
                                <li key={index} className="list-group-item">
                                    <span className="label">{log?.timestamp}:</span>
                                    <span className="value">{log?.action} by {log?.user}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


const UsersList = ({ navigate }) => {
    const users = dummyData.users;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        (user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user?.id?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!can('view_users')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="Access Denied"
                    description="You do not have permission to view Users."
                    buttonText="Back to Dashboard"
                    onButtonClick={() => navigate('DASHBOARD')}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('USERS_LIST')} navigate={navigate} />
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                {can('manage_users') && <Button onClick={() => console.log('Open Create User Form')}>+ Add New User</Button>}
            </div>
            <div className="list-controls">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="list-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="secondary" onClick={() => console.log('Open Filter Panel')}>Filter</Button>
                <Button type="secondary" onClick={() => console.log('Export Users')}>Export to Excel/PDF</Button>
            </div>
            {filteredUsers.length === 0 ? (
                <EmptyState
                    title="No Users Found"
                    description="Adjust your search or filters, or add a new user."
                    buttonText="Add New User"
                    onButtonClick={() => console.log('Open Create User Form')}
                />
            ) : (
                <div className="card-grid">
                    {filteredUsers.map(user => (
                        <Card
                            key={user?.id}
                            title={user?.name}
                            meta={`Role: ${user?.role}`}
                            description={`Email: ${user?.email}`}
                            status={user?.status === 'ACTIVE' ? 'APPROVED' : 'CANCELLED'} // Map active to approved status color
                            onClick={() => navigate('USER_DETAIL', { id: user?.id })}
                        >
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color-light)' }}>
                                Last Login: {user?.lastLogin}
                            </span>
                            {can('manage_users') && (
                                <div className="card-actions">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); console.log(`Edit user ${user?.id}`); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginLeft: 'var(--spacing-xs)' }}
                                    >Edit</button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const UserDetail = ({ navigate, params }) => {
    const user = dummyData.users.find(u => u.id === params?.id);

    const handleEdit = () => { console.log(`Editing User ${user?.id}`); };
    const handleDeactivate = () => { console.log(`Deactivating User ${user?.id}`); };

    if (!user || !can('view_users')) {
        return (
            <div className="main-content">
                <EmptyState
                    title="User Not Found or Access Denied"
                    description="The requested user does not exist or you do not have permission to view it."
                    buttonText="Back to Users"
                    onButtonClick={() => navigate('USERS_LIST')}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <Breadcrumbs path={getBreadcrumbs('USER_DETAIL', params)} navigate={navigate} />
            <div className="detail-page-container">
                <div className="detail-header">
                    <h1 className="detail-title">{user?.name}</h1>
                    <div className="detail-actions">
                        {can('manage_users') && (
                            <Button onClick={handleEdit} type="secondary">Edit User</Button>
                        )}
                        {can('manage_users') && user?.status === 'ACTIVE' && (
                            <Button onClick={handleDeactivate} type="danger">Deactivate User</Button>
                        )}
                        <span className={`status-badge status-${user?.status === 'ACTIVE' ? 'APPROVED' : 'CANCELLED'}`} style={{ backgroundColor: `var(${STATUS_CONFIG[user?.status === 'ACTIVE' ? 'APPROVED' : 'CANCELLED']?.colorVar})` }}>
                            {user?.status}
                        </span>
                    </div>
                </div>

                <div className="detail-section">
                    <h2 className="detail-section-title">User Details</h2>
                    <div className="detail-item"><strong>User ID:</strong><span>{user?.id}</span></div>
                    <div className="detail-item"><strong>Name:</strong><span>{user?.name}</span></div>
                    <div className="detail-item"><strong>Role:</strong><span>{user?.role}</span></div>
                    <div className="detail-item"><strong>Email:</strong><span>{user?.email}</span></div>
                    <div className="detail-item"><strong>Registration Date:</strong><span>{user?.registrationDate}</span></div>
                    <div className="detail-item"><strong>Last Login:</strong><span>{user?.lastLogin}</span></div>
                </div>

                {can('view_audit_logs') && (
                    <div className="detail-section">
                        <h2 className="detail-section-title">Activity Log (Sample)</h2>
                        <ul className="list-group">
                            <li className="list-group-item">
                                <span className="label">2024-05-20 10:30:</span>
                                <span className="value">Logged in</span>
                            </li>
                            <li className="list-group-item">
                                <span className="label">2024-05-18 14:00:</span>
                                <span className="value">Viewed Contract VSC001</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
    const globalSearchRef = useRef(null);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');

    const navigate = (screen, params = {}) => {
        setView(prevView => ({ ...prevView, screen, params }));
    };

    const handleGlobalSearch = (e) => {
        e.preventDefault();
        console.log("Performing global search for: " + globalSearchTerm);
        // In a real app, this would route to a global search results page.
        // For now, it just logs and clears or perhaps routes to dashboard.
        setGlobalSearchTerm('');
        navigate('DASHBOARD'); // Or a dedicated search results page
    };

    const handleLogout = () => {
        console.log("User logged out");
        // In a real app, clear auth tokens, redirect to login, etc.
        navigate('DASHBOARD'); // For now, just reset view
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-brand">VSC App</div>
                <nav className="header-nav">
                    {can('view_dashboard') && <button className={`header-nav-link ${view.screen === 'DASHBOARD' ? 'active' : ''}`} onClick={() => navigate('DASHBOARD')}>Dashboard</button>}
                    {can('view_contracts') && <button className={`header-nav-link ${view.screen.startsWith('CONTRACT') ? 'active' : ''}`} onClick={() => navigate('CONTRACTS_LIST')}>Contracts</button>}
                    {can('view_claims') && <button className={`header-nav-link ${view.screen.startsWith('CLAIM') ? 'active' : ''}`} onClick={() => navigate('CLAIMS_LIST')}>Claims</button>}
                    {can('view_renewals') && <button className={`header-nav-link ${view.screen.startsWith('RENEWAL') ? 'active' : ''}`} onClick={() => navigate('RENEWALS_LIST')}>Renewals</button>}
                    {can('view_users') && <button className={`header-nav-link ${view.screen.startsWith('USER') ? 'active' : ''}`} onClick={() => navigate('USERS_LIST')}>Users</button>}
                </nav>
                <div className="header-user-menu">
                    <span className="user-avatar">{USER_ROLE.split(' ').map(n => n[0]).join('')}</span>
                    <Button onClick={handleLogout} type="secondary">Logout</Button>
                </div>
            </header>

            <div className="global-search-container">
                <form onSubmit={handleGlobalSearch}>
                    <input
                        ref={globalSearchRef}
                        type="text"
                        placeholder="Global search (contracts, claims, users...)"
                        className="global-search-input"
                        value={globalSearchTerm}
                        onChange={(e) => setGlobalSearchTerm(e.target.value)}
                        style={{ pointerEvents: 'auto' }}
                    />
                </form>
            </div>

            {(() => {
                switch (view.screen) {
                    case 'DASHBOARD':
                        return <Dashboard navigate={navigate} />;
                    case 'CONTRACTS_LIST':
                        return <ContractsList navigate={navigate} />;
                    case 'CONTRACT_DETAIL':
                        return <ContractDetail navigate={navigate} params={view.params} />;
                    case 'CLAIMS_LIST':
                        return <ClaimsList navigate={navigate} />;
                    case 'CLAIM_DETAIL':
                        return <ClaimDetail navigate={navigate} params={view.params} />;
                    case 'RENEWALS_LIST':
                        return <RenewalsList navigate={navigate} />;
                    case 'RENEWAL_DETAIL':
                        return <RenewalDetail navigate={navigate} params={view.params} />;
                    case 'USERS_LIST':
                        return <UsersList navigate={navigate} />;
                    case 'USER_DETAIL':
                        return <UserDetail navigate={navigate} params={view.params} />;
                    default:
                        return <Dashboard navigate={navigate} />;
                }
            })()}
        </div>
    );
};

export default App;