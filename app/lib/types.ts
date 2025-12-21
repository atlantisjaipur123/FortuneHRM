import type { Company } from "./auth"

export type CompanyExtended = Company & {
	adminName?: string
	serviceName?: string
	startDate?: string | Date
	endDate?: string | Date

	// Company info extras
	code?: string
	flat?: string
	road?: string
	city?: string
	pin?: string
	state?: string
	stdCode?: string
	phone?: string
	email?: string
	dateOfStartingBusiness?: string
	typeOfCompany?: string
	pfRegionalOffice?: string
	pensionCoverageDate?: string
	esiLocalOffice?: string
	ptoCircleNo?: string
	website?: string
	defaultAttendance?: string
	companyVisibility?: string

	// Authorized person (AP) details
	apName?: string
	apDob?: string
	apSex?: string
	apPremise?: string
	apArea?: string
	apPin?: string
	apState?: string
	apStd?: string
	apPhone?: string
	apDesignation?: string
	apFatherName?: string
	apFlat?: string
	apRoad?: string
	apCity?: string
	apEmail?: string
	apPan?: string

	// Additional details
	cin?: string
	deductorType?: string
	paoCode?: string
	ministryName?: string
	ministryIfOthers?: string
	tdsCircle?: string
	ain?: string
	ddoCode?: string
	ddoRegNo?: string
	tanRegNo?: string
	lwfRegNo?: string
	branchDivision?: string
}


