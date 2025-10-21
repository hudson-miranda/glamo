USERS ||--o{ USER_SALONS : "participates in"
USERS ||--o{ CLIENTS : "linked (optional)"
USERS ||--o{ AVAILABLE_TIMESLOTS : "sets"
USERS ||--o{ NOTIFICATIONS : "receives"
USERS ||--o{ PAYMENTS : "makes"
USERS ||--o{ SALES : "buys"
USERS ||--o{ LOGS : "performs"

USERS {
    int id PK
    string name
    string email
    string password
    string phone
    string phone2
    string phoneType
    string phoneType2
    string address
    string adressNumber
    string complement
    string city
    string state
    string zipCode
    datetime birthDate
    string activeSalonId
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

USER_SALONS ||--o{ USER_ROLES : "has roles"
USER_SALONS {
    int id PK
    int userId FK
    int salonId FK
    string[] rolesInSalon
    string[] permmissionsInSalon
    boolean isActive
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

ROLES ||--o{ USER_ROLES : "assigned to"
ROLES ||--o{ ROLE_PERMISSIONS : "has permissions"
ROLES {
    int id PK
    int salonId FK
    string name
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

PERMISSIONS ||--o{ ROLE_PERMISSIONS : "part of"
PERMISSIONS {
    int id PK
    string name
    string description
    datetime createdAt
}

ROLE_PERMISSIONS ||--|| ROLES : "linked to"
ROLE_PERMISSIONS ||--|| PERMISSIONS : "linked to"
ROLE_PERMISSIONS {
    int id PK
    int roleId FK
    int permissionId FK
    datetime createdAt
}

USER_ROLES ||--|| USER_SALONS : "in context of"
USER_ROLES ||--|| ROLES : "is role"
USER_ROLES {
    int id PK
    int userSalonId FK
    int roleId FK
    datetime createdAt
}

LOGS {
    int id PK
    int userId FK
    string entity
    string entityId
    string action
    json before
    json after
    datetime createdAt
}

SALONS ||--o{ USER_SALONS : "has users"
SALONS ||--o{ SERVICES : "offers"
SALONS ||--o{ PRODUCTS : "sells"
SALONS ||--o{ PACKAGES : "provides"
SALONS ||--o{ AVAILABLE_TIMESLOTS : "sets"
SALONS ||--o{ NOTIFICATIONS : "sends"
SALONS ||--o{ SERVICE_ROOMS : "has rooms"

SALONS {
    int id PK
    string name
    string description
    string cnpj
    string address
    string adressNumber
    string complement
    string city
    string state
    string zipCode
    string phoneType
    string phone
    string phoneType2
    string phone2
    string email
    string[] targetAudience
    string siteUrl
    string facebookUrl
    string instagramUrl
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

AVAILABLE_TIMESLOTS ||--|| USERS : "belongs to"
AVAILABLE_TIMESLOTS ||--|| SALONS : "defined at"
AVAILABLE_TIMESLOTS {
    int id PK
    int userId FK
    int salonId FK
    string weekday
    time startTime
    time endTime
    boolean isAvailable
    datetime createdAt
    datetime updatedAt
}

NOTIFICATIONS ||--|| USERS : "sent to"
NOTIFICATIONS ||--|| SALONS : "contextual to"
NOTIFICATIONS {
    int id PK
    int userId FK
    int salonId FK
    string title
    string message
    string type
    boolean systemGenerated
    boolean read
    datetime createdAt
}

SERVICE_ROOMS {
    int id PK
    int salonId FK
    string name
    string description
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

CLIENTS ||--|| USERS : "optional"
CLIENTS ||--o{ CLIENT_CREDITS : "receives"
CLIENTS ||--o{ APPOINTMENTS : "schedules"
CLIENTS ||--o{ SALES : "generates"

CLIENTS {
    int id PK
    int salonId FK
    int userId FK
    string name
    string email
    string phone
    string observations
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

CLIENT_CREDITS ||--o{ CREDIT_PAYMENTS : "used in"
CLIENT_CREDITS {
    int id PK
    int clientId FK
    int professionalId FK
    int salonId FK
    float amount
    string origin
    string paymentMethod
    datetime date
    string notes
    datetime createdAt
    datetime updatedAt
}

PAYMENTS ||--o{ CREDIT_PAYMENTS : "consumes credits"
PAYMENTS ||--|| USERS : "made by"
PAYMENTS ||--|| SALES : "for sale"
PAYMENTS ||--|| PAYMENT_METHODS : "uses method"

PAYMENTS {
    int id PK
    int userId FK
    int saleId FK
    int methodId FK
    float amount
    string status
    datetime createdAt
}

PAYMENT_METHODS {
    int id PK
    string name
    string type
    boolean isOnline
}

CREDIT_PAYMENTS {
    int id PK
    int paymentId FK
    int creditId FK
    float amountUsed
    datetime createdAt
}

SERVICES ||--o{ SERVICE_CATEGORIES : "categorized as"
SERVICES ||--o{ SALE_SERVICES : "sold in"
SERVICES ||--o{ SERVICE_VARIANTS : "has variants"
SERVICES ||--|| COMMISSION_CONFIGS : "commission rule"
SERVICES ||--|| USERS : "created by"
SERVICES ||--|| SERVICE_ROOMS : "performed in"

SERVICES {
    int id PK
    int salonId FK
    int createdByUserId FK
    int updatedByUserId FK
    int serviceRoomId FK
    string name
    string description
    boolean hasVariants
    int duration
    float price
    float costValue
    string costValueType
    float nonCommissionableValue
    string nonCommissionableValueType
    string cardColor
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

SERVICE_VARIANTS {
    int id PK
    int serviceId FK
    string name
    string description
    int duration
    float price
    float costValue
    string costValueType
    float nonCommissionableValue
    string nonCommissionableValueType
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

COMMISSION_CONFIGS {
    int id PK
    int serviceId FK
    string commissionType
    string baseValueType
    float baseValue
    boolean deductAssistantsFromProfessional
    float soloValue
    string soloValueType
    float withAssistantValue
    string withAssistantValueType
    float asAssistantValue
    string asAssistantValueType
    datetime createdAt
    datetime updatedAt
}

SERVICE_CATEGORIES {
    int id PK
    int serviceId FK
    string name
    string color
    datetime createdAt
    datetime updatedAt
}

PACKAGES ||--o{ PACKAGE_SERVICES : "includes"
PACKAGES ||--|| USERS : "created by"

PACKAGES {
    int id PK
    int salonId FK
    int createdByUserId FK
    int updatedByUserId FK
    string name
    string description
    float totalPrice
    string validityType
    int validityValue
    boolean isArchived
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

PACKAGE_SERVICES ||--|| SERVICES : "linked"
PACKAGE_SERVICES ||--|| PACKAGES : "belongs to"
PACKAGE_SERVICES {
    int id PK
    int packageId FK
    int serviceId FK
    float customUnitPrice
    int quantity
    datetime createdAt
    datetime updatedAt
}

PRODUCTS ||--|| PRODUCT_CATEGORIES : "category"
PRODUCTS ||--|| PRODUCT_BRANDS : "brand"
PRODUCTS ||--|| SUPPLIERS : "supplier"
PRODUCTS ||--o{ STOCK_RECORDS : "movements"
PRODUCTS ||--|| USERS : "created by"

PRODUCTS {
    int id PK
    int salonId FK
    int categoryId FK
    int brandId FK
    int supplierId FK
    int createdByUserId FK
    int updatedByUserId FK
    string name
    float costPrice
    float salePrice
    int stockQuantity
    int initialStock
    int minimumStock
    float saleCommissionValue
    string saleCommissionType
    string unitOfMeasure
    int quantityPerPackage
    string barcode
    string sku
    boolean isArchived
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

PRODUCT_CATEGORIES {
    int id PK
    int salonId FK
    string name
    string description
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

PRODUCT_BRANDS {
    int id PK
    int salonId FK
    string name
    string description
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

SUPPLIERS {
    int id PK
    int salonId FK
    string name
    string description
    string email
    string phoneType
    string phone
    string phoneType2
    string phone2
    string contactName
    string cnpj
    string address
    string adressNumber
    string complement
    string city
    string state
    string zipCode
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

STOCK_RECORDS ||--|| PRODUCTS : "related to"
STOCK_RECORDS {
    int id PK
    int productId FK
    string movementType
    int quantity
    string reason
    datetime date
    datetime createdAt
    datetime updatedAt
}

APPOINTMENTS ||--|| CLIENTS : "by"
APPOINTMENTS ||--|| USERS : "professional"
APPOINTMENTS ||--|| SALONS : "at"
APPOINTMENTS ||--|| VOUCHERS : "uses"
APPOINTMENTS ||--o{ APPOINTMENT_SERVICES : "includes"
APPOINTMENTS ||--o{ APPOINTMENT_ASSISTANTS : "has assistants"
APPOINTMENTS ||--|| APPOINTMENT_REPETITIONS : "recurs with"
APPOINTMENTS ||--o{ APPOINTMENT_STATUS_LOGS : "status history"

APPOINTMENTS {
    int id PK
    int salonId FK
    int clientId FK
    int professionalId FK
    int voucherId FK
    datetime date
    time startTime
    string status
    string paymentStatus
    string notes
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

APPOINTMENT_STATUS_LOGS {
    int id PK
    int appointmentId FK
    int updatedByUserId FK
    string fromStatus
    string toStatus
    datetime changedAt
}

APPOINTMENT_SERVICES ||--|| SERVICES : "of"
APPOINTMENT_SERVICES {
    int id PK
    int appointmentId FK
    int serviceId FK
    int variantId FK
    float customPrice
    int customDuration
    string discountType
    float discountValue
    datetime createdAt
    datetime updatedAt
}

APPOINTMENT_ASSISTANTS ||--|| USERS : "assistant"
APPOINTMENT_ASSISTANTS {
    int id PK
    int appointmentId FK
    int userId FK
    datetime createdAt
}

APPOINTMENT_REPETITIONS {
    int id PK
    int appointmentId FK
    int intervalValue
    string intervalUnit
    date repeatUntil
    datetime createdAt
}

VOUCHERS ||--o{ APPOINTMENTS : "used in"
VOUCHERS ||--o{ SALES : "used in"

VOUCHERS {
    int id PK
    int userId FK
    string code
    float discountValue
    float discountPercentage
    string discountType
    string applicableTo
    int applicableEntityId FK
    int usageLimit
    int usedCount
    datetime expirationDate
    datetime issueDate
    string status
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

SALES ||--o{ SALE_SERVICES : "includes services"
SALES ||--o{ SALE_PRODUCTS : "includes products"
SALES ||--o{ SALE_PACKAGES : "includes packages"
SALES ||--|| USERS : "handled by employee"
SALES ||--|| CLIENTS : "by client"
SALES ||--|| VOUCHERS : "discounted by"
SALES ||--|| USERS : "created by"

SALES {
    int id PK
    int clientId FK
    int employeeId FK
    int voucherId FK
    int createdByUserId FK
    int updatedByUserId FK
    float originalTotal
    float discountApplied
    float finalTotal
    datetime date
    datetime createdAt
    datetime updatedAt
    datetime deletedAt
}

SALE_SERVICES {
    int id PK
    int saleId FK
    int serviceId FK
    int variantId FK
    float unitPrice
    float discount
    float finalPrice
    datetime createdAt
}

SALE_PRODUCTS {
    int id PK
    int saleId FK
    int productId FK
    int quantity
    float unitPrice
    float discount
    float finalPrice
    datetime createdAt
}

SALE_PACKAGES {
    int id PK
    int saleId FK
    int packageId FK
    float originalPrice
    float discount
    float finalPrice
    datetime createdAt
}