import type { PrismaClient, FormFieldType } from "@/generated/prisma/client";

type FieldSeed = {
  key: string;
  label: string;
  type: FormFieldType;
  section: string;
  isRequired?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

function field(
  key: string,
  label: string,
  type: FormFieldType,
  section: string,
  extra?: Partial<FieldSeed>
): FieldSeed {
  return { key, label, type, section, isRequired: false, ...extra };
}

const PRODUCT_FORMS: Record<string, { name: string; fields: FieldSeed[] }> = {
  "motor-insurance": {
    name: "Motor Insurance Application",
    fields: [
      field("fullName", "Full Name", "TEXT", "Applicant Details", { isRequired: true }),
      field("dateOfBirth", "Date of Birth", "DATE", "Applicant Details", { isRequired: true }),
      field("nationalId", "National ID", "TEXT", "Applicant Details", { isRequired: true }),
      field("kraPin", "KRA PIN", "TEXT", "Applicant Details", { isRequired: true }),
      field("phone", "Phone Number", "PHONE", "Applicant Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Applicant Details", { isRequired: true }),
      field("registrationNumber", "Registration Number", "TEXT", "Vehicle Details", { isRequired: true }),
      field("make", "Make", "TEXT", "Vehicle Details", { isRequired: true }),
      field("model", "Model", "TEXT", "Vehicle Details", { isRequired: true }),
      field("year", "Year", "NUMBER", "Vehicle Details", { isRequired: true }),
      field("engineCapacity", "Engine Capacity", "TEXT", "Vehicle Details", { isRequired: true }),
      field("chassisNumber", "Chassis Number", "TEXT", "Vehicle Details", { isRequired: true }),
      field("logbookNumber", "Logbook Number", "TEXT", "Vehicle Details", { isRequired: true }),
      field("vehicleValue", "Vehicle Value (KES)", "CURRENCY", "Vehicle Details", { isRequired: true }),
      field("purchaseDate", "Purchase Date", "DATE", "Vehicle Details"),
      field("vehicleUsage", "Vehicle Usage", "SELECT", "Vehicle Details", {
        isRequired: true,
        options: [
          { value: "private", label: "Private" },
          { value: "commercial", label: "Commercial" },
          { value: "psv", label: "PSV" },
        ],
      }),
      field("coverType", "Cover Type", "SELECT", "Cover Type", {
        isRequired: true,
        options: [
          { value: "comprehensive", label: "Comprehensive" },
          { value: "third_party", label: "Third Party" },
          { value: "third_party_fire_theft", label: "Third Party Fire & Theft" },
        ],
      }),
      field("excessProtector", "Excess Protector", "BOOLEAN", "Additional Covers"),
      field("politicalViolence", "Political Violence", "BOOLEAN", "Additional Covers"),
      field("roadRescue", "Road Rescue", "BOOLEAN", "Additional Covers"),
      field("courtesyCar", "Courtesy Car", "BOOLEAN", "Additional Covers"),
      field("nationalIdDoc", "National ID", "FILE", "Upload Documents", { isRequired: true }),
      field("kraPinDoc", "KRA PIN", "FILE", "Upload Documents", { isRequired: true }),
      field("logbookDoc", "Logbook", "FILE", "Upload Documents", { isRequired: true }),
      field("inspectionReport", "Inspection Report", "FILE", "Upload Documents"),
    ],
  },
  "medical-insurance": {
    name: "Medical Insurance Application",
    fields: [
      field("fullName", "Full Name", "TEXT", "Applicant Details", { isRequired: true }),
      field("dateOfBirth", "Date of Birth", "DATE", "Applicant Details", { isRequired: true }),
      field("phone", "Phone Number", "PHONE", "Applicant Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Applicant Details", { isRequired: true }),
      field("dependants", "Dependants", "NUMBER", "Coverage", { isRequired: true }),
      field("coverageLimit", "Coverage Limit (KES)", "CURRENCY", "Coverage", { isRequired: true }),
      field("age", "Age", "NUMBER", "Coverage", { isRequired: true }),
      field("existingConditions", "Existing Conditions", "TEXTAREA", "Coverage"),
      field("preferredHospital", "Preferred Hospital", "TEXT", "Coverage"),
      field("familyMembers", "Family Members", "NUMBER", "Coverage"),
      field("medicalRecords", "Medical Records", "FILE", "Upload Documents"),
    ],
  },
  "travel-insurance": {
    name: "Travel Insurance Application",
    fields: [
      field("fullName", "Full Name", "TEXT", "Traveller Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Traveller Details", { isRequired: true }),
      field("phone", "Phone Number", "PHONE", "Traveller Details", { isRequired: true }),
      field("destination", "Destination Countries", "TEXT", "Trip Details", { isRequired: true }),
      field("travelStart", "Travel Start Date", "DATE", "Trip Details", { isRequired: true }),
      field("travelEnd", "Travel End Date", "DATE", "Trip Details", { isRequired: true }),
      field("purpose", "Purpose", "SELECT", "Trip Details", {
        isRequired: true,
        options: [
          { value: "business", label: "Business" },
          { value: "leisure", label: "Leisure" },
          { value: "pilgrimage", label: "Pilgrimage" },
          { value: "students", label: "Students" },
        ],
      }),
      field("travellersCount", "Travellers Count", "NUMBER", "Trip Details", { isRequired: true }),
      field("passportDoc", "Passport Upload", "FILE", "Upload Documents", { isRequired: true }),
    ],
  },
  "life-insurance": {
    name: "Life Insurance Application",
    fields: [
      field("fullName", "Full Name", "TEXT", "Applicant Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Applicant Details", { isRequired: true }),
      field("phone", "Phone Number", "PHONE", "Applicant Details", { isRequired: true }),
      field("income", "Annual Income (KES)", "CURRENCY", "Coverage", { isRequired: true }),
      field("dependants", "Dependants", "NUMBER", "Coverage", { isRequired: true }),
      field("coverageAmount", "Coverage Amount (KES)", "CURRENCY", "Coverage", { isRequired: true }),
      field("beneficiaries", "Beneficiaries", "TEXTAREA", "Coverage", { isRequired: true }),
      field("occupation", "Occupation", "TEXT", "Coverage", { isRequired: true }),
      field("healthQuestions", "Health Questions", "TEXTAREA", "Health Declaration"),
    ],
  },
  "home-insurance": {
    name: "Home Insurance Application",
    fields: [
      field("fullName", "Full Name", "TEXT", "Applicant Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Applicant Details", { isRequired: true }),
      field("phone", "Phone Number", "PHONE", "Applicant Details", { isRequired: true }),
      field("propertyValue", "Property Value (KES)", "CURRENCY", "Property", { isRequired: true }),
      field("location", "Location", "TEXT", "Property", { isRequired: true }),
      field("propertyType", "Property Type", "SELECT", "Property", {
        isRequired: true,
        options: [
          { value: "apartment", label: "Apartment" },
          { value: "bungalow", label: "Bungalow" },
          { value: "maisonette", label: "Maisonette" },
        ],
      }),
      field("contentsValue", "Contents Value (KES)", "CURRENCY", "Property", { isRequired: true }),
      field("securityMeasures", "Security Measures", "TEXTAREA", "Property"),
    ],
  },
  "business-insurance": {
    name: "Business Insurance Application",
    fields: [
      field("businessName", "Business Name", "TEXT", "Business Details", { isRequired: true }),
      field("registrationNumber", "Registration Number", "TEXT", "Business Details", { isRequired: true }),
      field("contactEmail", "Contact Email", "EMAIL", "Business Details", { isRequired: true }),
      field("contactPhone", "Contact Phone", "PHONE", "Business Details", { isRequired: true }),
      field("industry", "Industry", "TEXT", "Business Details", { isRequired: true }),
      field("employees", "Employees", "NUMBER", "Business Details", { isRequired: true }),
      field("turnover", "Annual Turnover (KES)", "CURRENCY", "Business Details", { isRequired: true }),
      field("assetsValue", "Assets Value (KES)", "CURRENCY", "Business Details", { isRequired: true }),
    ],
  },
  "marine-insurance": {
    name: "Marine Insurance Application",
    fields: [
      field("fullName", "Applicant Name", "TEXT", "Shipment Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Shipment Details", { isRequired: true }),
      field("cargoType", "Cargo Type", "TEXT", "Shipment Details", { isRequired: true }),
      field("destination", "Destination", "TEXT", "Shipment Details", { isRequired: true }),
      field("weight", "Weight (kg)", "NUMBER", "Shipment Details", { isRequired: true }),
      field("shipmentValue", "Shipment Value (KES)", "CURRENCY", "Shipment Details", { isRequired: true }),
      field("frequency", "Shipment Frequency", "SELECT", "Shipment Details", {
        isRequired: true,
        options: [
          { value: "one_off", label: "One-off" },
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
        ],
      }),
    ],
  },
  "pet-insurance": {
    name: "Pet Insurance Application",
    fields: [
      field("fullName", "Owner Full Name", "TEXT", "Owner Details", { isRequired: true }),
      field("email", "Email", "EMAIL", "Owner Details", { isRequired: true }),
      field("phone", "Phone Number", "PHONE", "Owner Details", { isRequired: true }),
      field("petName", "Pet Name", "TEXT", "Pet Details", { isRequired: true }),
      field("species", "Species", "TEXT", "Pet Details", { isRequired: true }),
      field("breed", "Breed", "TEXT", "Pet Details", { isRequired: true }),
      field("petAge", "Age (years)", "NUMBER", "Pet Details", { isRequired: true }),
      field("vaccinationStatus", "Vaccination Status", "SELECT", "Pet Details", {
        isRequired: true,
        options: [
          { value: "up_to_date", label: "Up to date" },
          { value: "partial", label: "Partial" },
          { value: "none", label: "None" },
        ],
      }),
      field("medicalHistory", "Medical History", "TEXTAREA", "Pet Details"),
    ],
  },
};

export async function seedPurchaseForms(prisma: PrismaClient) {
  for (const [productSlug, config] of Object.entries(PRODUCT_FORMS)) {
    const product = await prisma.insuranceProduct.findUnique({
      where: { slug: productSlug },
    });
    if (!product) continue;

    const formSlug = `${productSlug}-application`;
    const sections = [...new Set(config.fields.map((f) => f.section))];

    const form = await prisma.formDefinition.upsert({
      where: { slug: formSlug },
      update: {
        name: config.name,
        productId: product.id,
        isActive: true,
        settings: { sections: sections.map((title, i) => ({ id: `s${i}`, title })) },
      },
      create: {
        slug: formSlug,
        name: config.name,
        productId: product.id,
        isActive: true,
        settings: { sections: sections.map((title, i) => ({ id: `s${i}`, title })) },
      },
    });

    await prisma.formField.deleteMany({ where: { formId: form.id } });

    await prisma.formField.createMany({
      data: config.fields.map((f, i) => ({
        formId: form.id,
        key: f.key,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        isRequired: f.isRequired ?? false,
        sortOrder: i,
        options: f.options ? (f.options as object) : undefined,
        validation: { section: f.section },
      })),
    });
  }

  console.log("Purchase application forms seeded.");
}
