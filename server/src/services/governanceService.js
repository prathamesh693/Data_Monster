import { dbService } from "./dbService.js";

const mockCatalog = [
  {
    entity: "users",
    owner: "identity-team@dataguard.local",
    samples: [
      {
        email: "alice@example.com",
        phone: "+1-202-555-0199",
        password: "hash$2b$10$2xYz9zR",
        shipping_address: "123 Market Street, Austin, TX",
      },
    ],
  },
  {
    entity: "products",
    owner: "catalog-team@dataguard.local",
    samples: [
      {
        product_name: "Laptop",
        category: "Electronics",
        sku: "LP-1002",
      },
    ],
  },
  {
    entity: "orders",
    owner: "orders-team@dataguard.local",
    samples: [
      {
        order_id: "ORD-102",
        email: "buyer@domain.com",
        shipping_address: "742 Evergreen Terrace",
      },
    ],
  },
  {
    entity: "audit_logs",
    owner: "security-team@dataguard.local",
    samples: [
      {
        action: "LOGIN",
        actor: "system-service",
        event_time: "2026-03-24T11:20:00Z",
      },
    ],
  },
];

const piiRegexMap = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9\-\s()]{10,}$/,
  password: /^.{8,}$/,
  shipping_address: /[0-9]{1,5}\s+\w+/i,
};

const classifyEntity = (entity, piiDetected) => {
  if (piiDetected.length > 0) {
    return {
      classification: "PII Data",
      sensitivity: "Restricted",
    };
  }

  if (/order|payment|transaction|price|cost/i.test(entity)) {
    return {
      classification: "Sensitive Financial",
      sensitivity: "Confidential",
    };
  }

  if (/log|audit|system/i.test(entity)) {
    return {
      classification: "General",
      sensitivity: "Internal",
    };
  }

  return {
    classification: "General",
    sensitivity: "Public",
  };
};

const detectPiiFields = (sample = {}) => {
  return Object.entries(sample)
    .filter(([key, value]) => {
      // Check column name
      if (/email|phone|password|card|address/i.test(key)) return true;
      // Check value pattern
      const detector = piiRegexMap[key.toLowerCase()];
      return detector && typeof value === "string" && detector.test(value);
    })
    .map(([key]) => key);
};

export const getGovernanceMetrics = async () => {
  const tablesResult = await dbService.getTables();
  
  if (tablesResult.mock || !tablesResult.ok) {
    const catalog = mockCatalog.map((item) => {
      const firstSample = item.samples[0] || {};
      const piiFields = detectPiiFields(firstSample);
      const { classification, sensitivity } = classifyEntity(item.entity, piiFields);

      return {
        entity: item.entity,
        classification,
        sensitivity,
        owner: item.owner,
        piiDetected: piiFields.length > 0,
        piiFields,
      };
    });

    return {
      maturityScore: 72,
      piiTablesCount: catalog.filter(c => c.piiDetected).length,
      classifiedTablesCount: catalog.length,
      catalog,
    };
  }

  // Real data logic
  const catalog = [];
  const tables = tablesResult.tables.slice(0, 10);
  const dbType = dbService.activeConnection.dbType;
  
  for (const table of tables) {
    let sample = {};
    
    try {
      if (dbType === "mongodb") {
        sample = await dbService.activeConnection.client.db
          .collection(table)
          .findOne() || {};
      } else {
        const sampleQuery = `SELECT * FROM ${table} LIMIT 1`;
        const queryResult = await dbService.executeQuery(sampleQuery);
        sample = queryResult.rows[0] || {};
      }
    } catch (e) {
      console.error(`Failed to sample table ${table}:`, e.message);
    }
    
    const piiFields = detectPiiFields(sample);
    const { classification, sensitivity } = classifyEntity(table, piiFields);

    catalog.push({
      entity: table,
      classification,
      sensitivity,
      owner: "DB Administrator",
      piiDetected: piiFields.length > 0,
      piiFields,
    });
  }

  return {
    maturityScore: 85,
    piiTablesCount: catalog.filter(c => c.piiDetected).length,
    classifiedTablesCount: catalog.length,
    catalog,
  };
};
