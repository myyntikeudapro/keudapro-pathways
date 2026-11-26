export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_talent_members: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_talent_projects: {
        Row: {
          commitment_accepted: boolean
          created_at: string
          created_by: string | null
          data_scope: string | null
          deliverable: string | null
          id: string
          metric: string | null
          owner_name: string | null
          owner_org: string
          participant_user_id: string | null
          path: number
          problem: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          commitment_accepted?: boolean
          created_at?: string
          created_by?: string | null
          data_scope?: string | null
          deliverable?: string | null
          id?: string
          metric?: string | null
          owner_name?: string | null
          owner_org?: string
          participant_user_id?: string | null
          path: number
          problem?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          commitment_accepted?: boolean
          created_at?: string
          created_by?: string | null
          data_scope?: string | null
          deliverable?: string | null
          id?: string
          metric?: string | null
          owner_name?: string | null
          owner_org?: string
          participant_user_id?: string | null
          path?: number
          problem?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          ai_classified_at: string | null
          ai_level: string | null
          ai_model: string | null
          ai_procurement: string | null
          ai_recommendation: string | null
          company_programme_id: string | null
          contact_id: string | null
          created_at: string
          deal_value: number | null
          email: string
          handled_by: string | null
          id: string
          lost_reason: string | null
          meeting_format: string
          message: string
          mt_delegates: string[]
          mt_personal: boolean
          mt_production_owner: string | null
          name: string
          notes: string | null
          organization: string | null
          organization_id: string | null
          owner_id: string | null
          phone: string | null
          sale_closed_at: string | null
          service_key: string | null
          session_id: string | null
          source: string | null
          status: string
          training_model: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          ai_classified_at?: string | null
          ai_level?: string | null
          ai_model?: string | null
          ai_procurement?: string | null
          ai_recommendation?: string | null
          company_programme_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_value?: number | null
          email: string
          handled_by?: string | null
          id?: string
          lost_reason?: string | null
          meeting_format: string
          message: string
          mt_delegates?: string[]
          mt_personal?: boolean
          mt_production_owner?: string | null
          name: string
          notes?: string | null
          organization?: string | null
          organization_id?: string | null
          owner_id?: string | null
          phone?: string | null
          sale_closed_at?: string | null
          service_key?: string | null
          session_id?: string | null
          source?: string | null
          status?: string
          training_model?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          ai_classified_at?: string | null
          ai_level?: string | null
          ai_model?: string | null
          ai_procurement?: string | null
          ai_recommendation?: string | null
          company_programme_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_value?: number | null
          email?: string
          handled_by?: string | null
          id?: string
          lost_reason?: string | null
          meeting_format?: string
          message?: string
          mt_delegates?: string[]
          mt_personal?: boolean
          mt_production_owner?: string | null
          name?: string
          notes?: string | null
          organization?: string | null
          organization_id?: string | null
          owner_id?: string | null
          phone?: string | null
          sale_closed_at?: string | null
          service_key?: string | null
          session_id?: string | null
          source?: string | null
          status?: string
          training_model?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_company_programme_id_fkey"
            columns: ["company_programme_id"]
            isOneToOne: false
            referencedRelation: "prod_programme_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "crm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      card_categories: {
        Row: {
          category_slug: string
          created_at: string
          id: string
          label: string
          page_slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          id?: string
          label: string
          page_slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          id?: string
          label?: string
          page_slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cat_offerings: {
        Row: {
          administrative_ends_at: string | null
          capacity: number
          created_at: string
          delivery_id: string | null
          ends_at: string
          free_cancel_days: number
          go_decided_at: string | null
          go_decided_by: string | null
          go_reason: string | null
          go_status: string
          group_key: string | null
          id: string
          late_cancel_pct: number
          location: string | null
          min_participants: number | null
          price_version_id: string
          product_id: string
          reg_closes_at: string
          reg_opens_at: string
          registration_enabled: boolean
          schedule: Json
          source_deadline: string | null
          source_key: string | null
          source_status: string | null
          starts_at: string
          status: string
          waitlist_enabled: boolean
        }
        Insert: {
          administrative_ends_at?: string | null
          capacity: number
          created_at?: string
          delivery_id?: string | null
          ends_at: string
          free_cancel_days?: number
          go_decided_at?: string | null
          go_decided_by?: string | null
          go_reason?: string | null
          go_status?: string
          group_key?: string | null
          id?: string
          late_cancel_pct?: number
          location?: string | null
          min_participants?: number | null
          price_version_id: string
          product_id: string
          reg_closes_at: string
          reg_opens_at: string
          registration_enabled?: boolean
          schedule?: Json
          source_deadline?: string | null
          source_key?: string | null
          source_status?: string | null
          starts_at: string
          status?: string
          waitlist_enabled?: boolean
        }
        Update: {
          administrative_ends_at?: string | null
          capacity?: number
          created_at?: string
          delivery_id?: string | null
          ends_at?: string
          free_cancel_days?: number
          go_decided_at?: string | null
          go_decided_by?: string | null
          go_reason?: string | null
          go_status?: string
          group_key?: string | null
          id?: string
          late_cancel_pct?: number
          location?: string | null
          min_participants?: number | null
          price_version_id?: string
          product_id?: string
          reg_closes_at?: string
          reg_opens_at?: string
          registration_enabled?: boolean
          schedule?: Json
          source_deadline?: string | null
          source_key?: string | null
          source_status?: string | null
          starts_at?: string
          status?: string
          waitlist_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cat_offerings_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_offerings_price_version_id_fkey"
            columns: ["price_version_id"]
            isOneToOne: false
            referencedRelation: "cat_price_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_offerings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cat_products"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_parties: {
        Row: {
          billing_address: string | null
          billing_city: string | null
          billing_postal_code: string | null
          business_id: string | null
          contact_name: string
          created_at: string
          einvoice_address: string | null
          einvoice_operator: string | null
          email: string
          id: string
          kind: string
          order_reference: string | null
          org_name: string | null
          phone: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          business_id?: string | null
          contact_name: string
          created_at?: string
          einvoice_address?: string | null
          einvoice_operator?: string | null
          email: string
          id?: string
          kind: string
          order_reference?: string | null
          org_name?: string | null
          phone?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          business_id?: string | null
          contact_name?: string
          created_at?: string
          einvoice_address?: string | null
          einvoice_operator?: string | null
          email?: string
          id?: string
          kind?: string
          order_reference?: string | null
          org_name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      cat_price_versions: {
        Row: {
          created_at: string
          id: string
          locked_at: string | null
          product_id: string
          unit_price: number
          valid_from: string
          valid_to: string | null
          vat_basis: string
          version_no: number
        }
        Insert: {
          created_at?: string
          id?: string
          locked_at?: string | null
          product_id: string
          unit_price: number
          valid_from: string
          valid_to?: string | null
          vat_basis: string
          version_no: number
        }
        Update: {
          created_at?: string
          id?: string
          locked_at?: string | null
          product_id?: string
          unit_price?: number
          valid_from?: string
          valid_to?: string | null
          vat_basis?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "cat_price_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cat_products"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_products: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          production_owner_id: string
          published_at: string | null
          published_by: string | null
          sales_owner_id: string
          service_key: string
          slug: string
          status: string
          template_key: string | null
          training_card_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          production_owner_id: string
          published_at?: string | null
          published_by?: string | null
          sales_owner_id: string
          service_key: string
          slug: string
          status?: string
          template_key?: string | null
          training_card_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          production_owner_id?: string
          published_at?: string | null
          published_by?: string | null
          sales_owner_id?: string
          service_key?: string
          slug?: string
          status?: string
          template_key?: string | null
          training_card_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_products_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "prod_templates"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "cat_products_training_card_id_fkey"
            columns: ["training_card_id"]
            isOneToOne: false
            referencedRelation: "training_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_registration_answers: {
        Row: {
          billing_details_pending: boolean
          cancellation_accepted_at: string
          cancellation_url: string | null
          city: string
          created_at: string
          extra_info: string | null
          form_version: string
          id: string
          offering_id: string
          orientation: string | null
          payer_option: string
          payer_option_label: string
          phone_country: string
          phone_number: string
          postal_code: string
          price_accepted_at: string
          price_amount: number
          price_version_id: string
          privacy_accepted_at: string
          privacy_url: string | null
          program: string
          registration_id: string
          seat_id: string
          street_address: string
          terms_accepted_at: string | null
          terms_review_status: string | null
          terms_version: string | null
          vat_basis: string
        }
        Insert: {
          billing_details_pending?: boolean
          cancellation_accepted_at: string
          cancellation_url?: string | null
          city: string
          created_at?: string
          extra_info?: string | null
          form_version: string
          id?: string
          offering_id: string
          orientation?: string | null
          payer_option: string
          payer_option_label: string
          phone_country: string
          phone_number: string
          postal_code: string
          price_accepted_at: string
          price_amount: number
          price_version_id: string
          privacy_accepted_at: string
          privacy_url?: string | null
          program: string
          registration_id: string
          seat_id: string
          street_address: string
          terms_accepted_at?: string | null
          terms_review_status?: string | null
          terms_version?: string | null
          vat_basis: string
        }
        Update: {
          billing_details_pending?: boolean
          cancellation_accepted_at?: string
          cancellation_url?: string | null
          city?: string
          created_at?: string
          extra_info?: string | null
          form_version?: string
          id?: string
          offering_id?: string
          orientation?: string | null
          payer_option?: string
          payer_option_label?: string
          phone_country?: string
          phone_number?: string
          postal_code?: string
          price_accepted_at?: string
          price_amount?: number
          price_version_id?: string
          privacy_accepted_at?: string
          privacy_url?: string | null
          program?: string
          registration_id?: string
          seat_id?: string
          street_address?: string
          terms_accepted_at?: string | null
          terms_review_status?: string | null
          terms_version?: string | null
          vat_basis?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_registration_answers_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "cat_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registration_answers_price_version_id_fkey"
            columns: ["price_version_id"]
            isOneToOne: false
            referencedRelation: "cat_price_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registration_answers_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "cat_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registration_answers_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: true
            referencedRelation: "cat_seats"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_registrations: {
        Row: {
          billing_party_id: string
          buyer_party_id: string
          created_at: string
          id: string
          marketing_consent: boolean
          offering_id: string
          order_id: string | null
          payer_party_id: string
          privacy_version: string
          seats_requested: number
          source: string
          status: string
          terms_accepted_at: string
        }
        Insert: {
          billing_party_id: string
          buyer_party_id: string
          created_at?: string
          id?: string
          marketing_consent?: boolean
          offering_id: string
          order_id?: string | null
          payer_party_id: string
          privacy_version: string
          seats_requested: number
          source: string
          status?: string
          terms_accepted_at: string
        }
        Update: {
          billing_party_id?: string
          buyer_party_id?: string
          created_at?: string
          id?: string
          marketing_consent?: boolean
          offering_id?: string
          order_id?: string | null
          payer_party_id?: string
          privacy_version?: string
          seats_requested?: number
          source?: string
          status?: string
          terms_accepted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_registrations_billing_party_id_fkey"
            columns: ["billing_party_id"]
            isOneToOne: false
            referencedRelation: "cat_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registrations_buyer_party_id_fkey"
            columns: ["buyer_party_id"]
            isOneToOne: false
            referencedRelation: "cat_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registrations_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "cat_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registrations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "crm_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_registrations_payer_party_id_fkey"
            columns: ["payer_party_id"]
            isOneToOne: false
            referencedRelation: "cat_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_seats: {
        Row: {
          created_at: string
          hold_expires_at: string | null
          id: string
          offering_id: string
          participant_email: string | null
          participant_name: string | null
          registration_id: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hold_expires_at?: string | null
          id?: string
          offering_id: string
          participant_email?: string | null
          participant_name?: string | null
          registration_id: string
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hold_expires_at?: string | null
          id?: string
          offering_id?: string
          participant_email?: string | null
          participant_name?: string | null
          registration_id?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_seats_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "cat_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_seats_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "cat_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_waitlist: {
        Row: {
          created_at: string
          id: string
          offering_id: string
          position: number
          registration_id: string
          seats: number
          state: string
        }
        Insert: {
          created_at?: string
          id?: string
          offering_id: string
          position: number
          registration_id: string
          seats: number
          state?: string
        }
        Update: {
          created_at?: string
          id?: string
          offering_id?: string
          position?: number
          registration_id?: string
          seats?: number
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "cat_waitlist_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "cat_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cat_waitlist_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "cat_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_assignment_cursors: {
        Row: {
          next_index: number
          service_key: string
        }
        Insert: {
          next_index?: number
          service_key: string
        }
        Update: {
          next_index?: number
          service_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_assignment_cursors_service_key_fkey"
            columns: ["service_key"]
            isOneToOne: true
            referencedRelation: "crm_assignment_rules"
            referencedColumns: ["service_key"]
          },
        ]
      }
      crm_assignment_rules: {
        Row: {
          enabled: boolean
          member_ids: string[]
          service_key: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          member_ids?: string[]
          service_key: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          member_ids?: string[]
          service_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_audit: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json
          created_at: string
          id: string
          row_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes: Json
          created_at?: string
          id?: string
          row_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json
          created_at?: string
          id?: string
          row_id?: string
          table_name?: string
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "crm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_customer_link_ops: {
        Row: {
          actor_id: string | null
          created_at: string
          lead_id: string
          op_key: string
          request_hash: string
          result: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          lead_id: string
          op_key: string
          request_hash: string
          result: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          lead_id?: string
          op_key?: string
          request_hash?: string
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "crm_customer_link_ops_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_deliveries: {
        Row: {
          id: string
          kind: string
          message_id: string | null
          recipient_id: string
          run_id: string
          state: string
        }
        Insert: {
          id?: string
          kind: string
          message_id?: string | null
          recipient_id: string
          run_id: string
          state?: string
        }
        Update: {
          id?: string
          kind?: string
          message_id?: string | null
          recipient_id?: string
          run_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_deliveries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "crm_email_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_runs: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          kind: string
          period_key: string
          state: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          kind: string
          period_key: string
          state?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          period_key?: string
          state?: string
        }
        Relationships: []
      }
      crm_interactions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          lead_id: string
          occurred_at: string
          summary: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          kind: string
          lead_id: string
          occurred_at?: string
          summary: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          lead_id?: string
          occurred_at?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          created_at: string
          emailed_at: string | null
          id: string
          kind: string
          lead_id: string
          read_at: string | null
          recipient_id: string
        }
        Insert: {
          created_at?: string
          emailed_at?: string | null
          id?: string
          kind: string
          lead_id: string
          read_at?: string | null
          recipient_id: string
        }
        Update: {
          created_at?: string
          emailed_at?: string | null
          id?: string
          kind?: string
          lead_id?: string
          read_at?: string | null
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_offer_version_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          line_no: number
          quantity: number
          unit_price: number
          version_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_no: number
          quantity: number
          unit_price: number
          version_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_no?: number
          quantity?: number
          unit_price?: number
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_offer_version_lines_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "crm_offer_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_offer_versions: {
        Row: {
          approval_method: string | null
          approval_note: string | null
          approved_at: string | null
          approved_by: string | null
          contact_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          ends_on: string | null
          id: string
          offer_id: string
          organization_id: string | null
          payment_terms: string | null
          service_key: string | null
          starts_on: string | null
          terms: string | null
          vat_basis: string | null
          vat_rate: number | null
          version_no: number
        }
        Insert: {
          approval_method?: string | null
          approval_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          offer_id: string
          organization_id?: string | null
          payment_terms?: string | null
          service_key?: string | null
          starts_on?: string | null
          terms?: string | null
          vat_basis?: string | null
          vat_rate?: number | null
          version_no: number
        }
        Update: {
          approval_method?: string | null
          approval_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          offer_id?: string
          organization_id?: string | null
          payment_terms?: string | null
          service_key?: string | null
          starts_on?: string | null
          terms?: string | null
          vat_basis?: string | null
          vat_rate?: number | null
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_offer_versions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_offer_versions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "crm_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_offer_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "crm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_offers: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          expected_close: string
          id: string
          lead_id: string
          probability: number
          status: string
          title: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          expected_close: string
          id?: string
          lead_id: string
          probability?: number
          status?: string
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          expected_close?: string
          id?: string
          lead_id?: string
          probability?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_offers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_order_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          line_no: number
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_no: number
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_no?: number
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "crm_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_orders: {
        Row: {
          confirmed_at: string
          confirmed_by: string
          contact_id: string
          created_at: string
          ends_on: string | null
          id: string
          idempotency_key: string
          lead_id: string
          offer_version_id: string
          organization_id: string
          owner_id: string
          payment_terms: string
          service_key: string
          starts_on: string
          terms: string
          total_net: number
          vat_basis: string
          vat_rate: number
        }
        Insert: {
          confirmed_at?: string
          confirmed_by: string
          contact_id: string
          created_at?: string
          ends_on?: string | null
          id?: string
          idempotency_key: string
          lead_id: string
          offer_version_id: string
          organization_id: string
          owner_id: string
          payment_terms: string
          service_key: string
          starts_on: string
          terms: string
          total_net: number
          vat_basis: string
          vat_rate: number
        }
        Update: {
          confirmed_at?: string
          confirmed_by?: string
          contact_id?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          idempotency_key?: string
          lead_id?: string
          offer_version_id?: string
          organization_id?: string
          owner_id?: string
          payment_terms?: string
          service_key?: string
          starts_on?: string
          terms?: string
          total_net?: number
          vat_basis?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_orders_offer_version_id_fkey"
            columns: ["offer_version_id"]
            isOneToOne: true
            referencedRelation: "crm_offer_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "crm_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_organizations: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_production_handoffs: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          company_programme_id: string | null
          company_response_at: string | null
          company_response_by: string | null
          company_return_reason: string | null
          company_revision: number
          company_state: string | null
          handed_at: string
          handed_by: string
          id: string
          mt_response_at: string | null
          mt_response_by: string | null
          mt_return_reason: string | null
          mt_revision: number
          mt_state: string | null
          note: string | null
          order_id: string
          production_owner_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_programme_id?: string | null
          company_response_at?: string | null
          company_response_by?: string | null
          company_return_reason?: string | null
          company_revision?: number
          company_state?: string | null
          handed_at?: string
          handed_by?: string
          id?: string
          mt_response_at?: string | null
          mt_response_by?: string | null
          mt_return_reason?: string | null
          mt_revision?: number
          mt_state?: string | null
          note?: string | null
          order_id: string
          production_owner_id: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_programme_id?: string | null
          company_response_at?: string | null
          company_response_by?: string | null
          company_return_reason?: string | null
          company_revision?: number
          company_state?: string | null
          handed_at?: string
          handed_by?: string
          id?: string
          mt_response_at?: string | null
          mt_response_by?: string | null
          mt_return_reason?: string | null
          mt_revision?: number
          mt_state?: string | null
          note?: string | null
          order_id?: string
          production_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_production_handoffs_company_programme_id_fkey"
            columns: ["company_programme_id"]
            isOneToOne: false
            referencedRelation: "prod_programme_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_production_handoffs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "crm_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_sales_goals: {
        Row: {
          id: string
          leads_target: number
          month: string
          revenue_target: number
          service_key: string
          updated_at: string
          wins_target: number
        }
        Insert: {
          id?: string
          leads_target: number
          month: string
          revenue_target: number
          service_key: string
          updated_at?: string
          wins_target: number
        }
        Update: {
          id?: string
          leads_target?: number
          month?: string
          revenue_target?: number
          service_key?: string
          updated_at?: string
          wins_target?: number
        }
        Relationships: []
      }
      crm_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_at: string
          id: string
          lead_id: string
          owner_id: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at: string
          id?: string
          lead_id: string
          owner_id: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string
          id?: string
          lead_id?: string
          owner_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      exp_assignment_events: {
        Row: {
          action: string
          actor_id: string | null
          assignment_id: string
          created_at: string
          details: Json
          id: string
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          assignment_id: string
          created_at?: string
          details?: Json
          id?: string
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          assignment_id?: string
          created_at?: string
          details?: Json
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exp_assignment_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "exp_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      exp_assignments: {
        Row: {
          approval_reason: string | null
          approved_at: string | null
          approved_by: string | null
          conflict_reasons: string[]
          created_at: string
          expert_accepted_at: string | null
          expert_id: string
          id: string
          needs_approval: boolean
          requested_by: string
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          conflict_reasons?: string[]
          created_at?: string
          expert_accepted_at?: string | null
          expert_id: string
          id?: string
          needs_approval?: boolean
          requested_by: string
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          conflict_reasons?: string[]
          created_at?: string
          expert_accepted_at?: string | null
          expert_id?: string
          id?: string
          needs_approval?: boolean
          requested_by?: string
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exp_assignments_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "exp_experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exp_assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exp_assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      exp_availability: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          expert_id: string
          id: string
          kind: string
          note: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          expert_id: string
          id?: string
          kind: string
          note?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          expert_id?: string
          id?: string
          kind?: string
          note?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exp_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "exp_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      exp_commercial_terms: {
        Row: {
          contract_ref: string | null
          created_at: string
          day_rate: number | null
          expert_id: string
          hour_rate: number | null
          id: string
          note: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          contract_ref?: string | null
          created_at?: string
          day_rate?: number | null
          expert_id: string
          hour_rate?: number | null
          id?: string
          note?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          contract_ref?: string | null
          created_at?: string
          day_rate?: number | null
          expert_id?: string
          hour_rate?: number | null
          id?: string
          note?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exp_commercial_terms_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "exp_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      exp_expert_skills: {
        Row: {
          expert_id: string
          level: number
          skill_id: string
        }
        Insert: {
          expert_id: string
          level: number
          skill_id: string
        }
        Update: {
          expert_id?: string
          level?: number
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exp_expert_skills_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "exp_experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exp_expert_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "exp_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      exp_experts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          name: string
          region: string
          remote_ok: boolean
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          name: string
          region: string
          remote_ok?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          name?: string
          region?: string
          remote_ok?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      exp_skills: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      exp_template_fit: {
        Row: {
          approved_at: string
          approved_by: string | null
          expert_id: string
          status: string
          template_key: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          expert_id: string
          status: string
          template_key: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          expert_id?: string
          status?: string
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "exp_template_fit_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "exp_experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exp_template_fit_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "prod_templates"
            referencedColumns: ["key"]
          },
        ]
      }
      lead_activity: {
        Row: {
          actor_id: string | null
          changes: Json
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          actor_id?: string | null
          changes: Json
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          actor_id?: string | null
          changes?: Json
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          ad_campaign_id: string | null
          ad_campaign_name: string | null
          created_at: string
          created_by: string | null
          id: string
          landing_path: string
          name: string
          platform: string | null
          service_key: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
        }
        Insert: {
          ad_campaign_id?: string | null
          ad_campaign_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          landing_path: string
          name: string
          platform?: string | null
          service_key: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
        }
        Update: {
          ad_campaign_id?: string | null
          ad_campaign_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          landing_path?: string
          name?: string
          platform?: string | null
          service_key?: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
        }
        Relationships: []
      }
      marketing_events: {
        Row: {
          created_at: string
          device: string | null
          event: string
          id: string
          path: string | null
          props: Json
          referrer_host: string | null
          session_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          device?: string | null
          event: string
          id?: string
          path?: string | null
          props?: Json
          referrer_host?: string | null
          session_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          device?: string | null
          event?: string
          id?: string
          path?: string | null
          props?: Json
          referrer_host?: string | null
          session_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      pks_adviser_usage: {
        Row: {
          bucket_key: string
          request_count: number
          window_start: string
        }
        Insert: {
          bucket_key: string
          request_count?: number
          window_start: string
        }
        Update: {
          bucket_key?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      prod_actuals: {
        Row: {
          attendees: number
          created_at: string
          held: boolean
          hours: number
          id: string
          note: string | null
          recorded_by: string | null
          session_id: string
        }
        Insert: {
          attendees: number
          created_at?: string
          held: boolean
          hours: number
          id?: string
          note?: string | null
          recorded_by?: string | null
          session_id: string
        }
        Update: {
          attendees?: number
          created_at?: string
          held?: boolean
          hours?: number
          id?: string
          note?: string | null
          recorded_by?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_actuals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_actuals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      prod_attendance: {
        Row: {
          hours: number
          id: string
          note: string | null
          participant_id: string
          recorded_at: string
          recorded_by: string | null
          session_id: string
          status: string
        }
        Insert: {
          hours?: number
          id?: string
          note?: string | null
          participant_id: string
          recorded_at?: string
          recorded_by?: string | null
          session_id: string
          status: string
        }
        Update: {
          hours?: number
          id?: string
          note?: string | null
          participant_id?: string
          recorded_at?: string
          recorded_by?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_attendance_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "prod_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      prod_billing_readiness: {
        Row: {
          billing_ready: boolean
          checked_at: string | null
          checked_by: string | null
          delivery_id: string
          id: string
          note: string | null
          payment_status: string
          updated_at: string
        }
        Insert: {
          billing_ready?: boolean
          checked_at?: string | null
          checked_by?: string | null
          delivery_id: string
          id?: string
          note?: string | null
          payment_status?: string
          updated_at?: string
        }
        Update: {
          billing_ready?: boolean
          checked_at?: string | null
          checked_by?: string | null
          delivery_id?: string
          id?: string
          note?: string | null
          payment_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_billing_readiness_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: true
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_blockers: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_id: string
          description: string
          id: string
          owner_id: string
          resolved_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_id: string
          description: string
          id?: string
          owner_id: string
          resolved_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_id?: string
          description?: string
          id?: string
          owner_id?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prod_blockers_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_deliveries: {
        Row: {
          company_programme_id: string | null
          created_at: string
          created_by: string | null
          id: string
          offering_group: string | null
          order_id: string | null
          production_owner_id: string
          production_status: string
          sales_owner_id: string
          template_key: string
          title: string
          training_model: string | null
          updated_at: string
        }
        Insert: {
          company_programme_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          offering_group?: string | null
          order_id?: string | null
          production_owner_id: string
          production_status?: string
          sales_owner_id: string
          template_key: string
          title: string
          training_model?: string | null
          updated_at?: string
        }
        Update: {
          company_programme_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          offering_group?: string | null
          order_id?: string | null
          production_owner_id?: string
          production_status?: string
          sales_owner_id?: string
          template_key?: string
          title?: string
          training_model?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_deliveries_company_programme_id_fkey"
            columns: ["company_programme_id"]
            isOneToOne: false
            referencedRelation: "prod_programme_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "crm_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_deliveries_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "prod_templates"
            referencedColumns: ["key"]
          },
        ]
      }
      prod_feedback: {
        Row: {
          comment: string | null
          created_at: string
          delivery_id: string
          id: string
          recorded_by: string | null
          score: number
          session_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          delivery_id: string
          id?: string
          recorded_by?: string | null
          score: number
          session_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          delivery_id?: string
          id?: string
          recorded_by?: string | null
          score?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prod_feedback_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      prod_message_drafts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          audience: string
          body: string
          created_at: string
          created_by: string | null
          delivery_id: string
          id: string
          send_state: string
          subject: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          audience: string
          body: string
          created_at?: string
          created_by?: string | null
          delivery_id: string
          id?: string
          send_state?: string
          subject: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          delivery_id?: string
          id?: string
          send_state?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_message_drafts_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_participants: {
        Row: {
          certificate_status: string
          completion_status: string
          created_at: string
          delivery_id: string
          email: string | null
          id: string
          name: string
          registration_id: string | null
          removed_at: string | null
          seat_id: string | null
        }
        Insert: {
          certificate_status?: string
          completion_status?: string
          created_at?: string
          delivery_id: string
          email?: string | null
          id?: string
          name: string
          registration_id?: string | null
          removed_at?: string | null
          seat_id?: string | null
        }
        Update: {
          certificate_status?: string
          completion_status?: string
          created_at?: string
          delivery_id?: string
          email?: string | null
          id?: string
          name?: string
          registration_id?: string | null
          removed_at?: string | null
          seat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prod_participants_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_programme_approvals: {
        Row: {
          event_revision: number
          id: string
          kind: string
          programme_version_id: string
          reason: string | null
          recorded_at: string
          recorded_by: string
          snapshot: Json
        }
        Insert: {
          event_revision: number
          id?: string
          kind: string
          programme_version_id: string
          reason?: string | null
          recorded_at?: string
          recorded_by: string
          snapshot: Json
        }
        Update: {
          event_revision?: number
          id?: string
          kind?: string
          programme_version_id?: string
          reason?: string | null
          recorded_at?: string
          recorded_by?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "prod_programme_approvals_programme_version_id_fkey"
            columns: ["programme_version_id"]
            isOneToOne: false
            referencedRelation: "prod_programme_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_programme_versions: {
        Row: {
          capacity: Json
          case_lead_id: string
          created_at: string
          created_by: string
          id: string
          production_owner_id: string
          programme: Json
          promises: string
          resource_list_verified: boolean
          resource_plan: Json
          responsible_trainer_id: string | null
          review_findings: Json
          revision: number
          sales_owner_id: string
          source_version_id: string | null
          state: string
        }
        Insert: {
          capacity?: Json
          case_lead_id: string
          created_at?: string
          created_by: string
          id?: string
          production_owner_id: string
          programme?: Json
          promises?: string
          resource_list_verified?: boolean
          resource_plan?: Json
          responsible_trainer_id?: string | null
          review_findings?: Json
          revision: number
          sales_owner_id: string
          source_version_id?: string | null
          state?: string
        }
        Update: {
          capacity?: Json
          case_lead_id?: string
          created_at?: string
          created_by?: string
          id?: string
          production_owner_id?: string
          programme?: Json
          promises?: string
          resource_list_verified?: boolean
          resource_plan?: Json
          responsible_trainer_id?: string | null
          review_findings?: Json
          revision?: number
          sales_owner_id?: string
          source_version_id?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_programme_versions_case_lead_id_fkey"
            columns: ["case_lead_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_programme_versions_source_version_id_fkey"
            columns: ["source_version_id"]
            isOneToOne: false
            referencedRelation: "prod_programme_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_quality_issues: {
        Row: {
          closed_at: string | null
          corrective_action: string | null
          created_at: string
          created_by: string | null
          delivery_id: string
          description: string
          id: string
          owner_id: string
          session_id: string | null
          severity: string
        }
        Insert: {
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          delivery_id: string
          description: string
          id?: string
          owner_id: string
          session_id?: string | null
          severity: string
        }
        Update: {
          closed_at?: string | null
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          delivery_id?: string
          description?: string
          id?: string
          owner_id?: string
          session_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_quality_issues_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_quality_issues_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_quality_issues_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      prod_resource_bookings: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_resource_bookings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "prod_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_resource_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_resource_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      prod_resources: {
        Row: {
          created_at: string
          id: string
          kind: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name?: string
        }
        Relationships: []
      }
      prod_sessions: {
        Row: {
          created_at: string
          delivery_id: string
          delivery_mode: string
          ends_at: string
          id: string
          location: string | null
          offering_schedule_key: string | null
          provider_name: string | null
          region: string | null
          seq: number
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string
          delivery_id: string
          delivery_mode?: string
          ends_at: string
          id?: string
          location?: string | null
          offering_schedule_key?: string | null
          provider_name?: string | null
          region?: string | null
          seq: number
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string
          delivery_id?: string
          delivery_mode?: string
          ends_at?: string
          id?: string
          location?: string | null
          offering_schedule_key?: string | null
          provider_name?: string | null
          region?: string | null
          seq?: number
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_sessions_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_tasks: {
        Row: {
          anchor: string
          blocks_start: boolean
          code: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          delivery_id: string
          due_at: string | null
          due_manual: boolean
          id: string
          offset_days: number
          owner_id: string | null
          owner_role: string
          scope: string
          template_task_id: string | null
          title: string
        }
        Insert: {
          anchor: string
          blocks_start: boolean
          code: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          delivery_id: string
          due_at?: string | null
          due_manual?: boolean
          id?: string
          offset_days: number
          owner_id?: string | null
          owner_role: string
          scope: string
          template_task_id?: string | null
          title: string
        }
        Update: {
          anchor?: string
          blocks_start?: boolean
          code?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          delivery_id?: string
          due_at?: string | null
          due_manual?: boolean
          id?: string
          offset_days?: number
          owner_id?: string | null
          owner_role?: string
          scope?: string
          template_task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_tasks_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "prod_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_tasks_template_task_id_fkey"
            columns: ["template_task_id"]
            isOneToOne: false
            referencedRelation: "prod_template_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_template_tasks: {
        Row: {
          anchor: string
          blocks_start: boolean
          code: string
          id: string
          offset_days: number
          owner_role: string
          scope: string
          sort_order: number
          template_key: string | null
          title: string
        }
        Insert: {
          anchor: string
          blocks_start?: boolean
          code: string
          id?: string
          offset_days: number
          owner_role: string
          scope: string
          sort_order?: number
          template_key?: string | null
          title: string
        }
        Update: {
          anchor?: string
          blocks_start?: boolean
          code?: string
          id?: string
          offset_days?: number
          owner_role?: string
          scope?: string
          sort_order?: number
          template_key?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_template_tasks_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "prod_templates"
            referencedColumns: ["key"]
          },
        ]
      }
      prod_templates: {
        Row: {
          created_at: string
          description: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      prod_trainer_bookings: {
        Row: {
          created_at: string
          id: string
          session_id: string
          status: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          status?: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_trainer_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prod_trainer_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prod_trainer_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      training_cards: {
        Row: {
          category_id: string
          created_at: string
          cta_type: Database["public"]["Enums"]["cta_type"]
          cta_url: string | null
          id: string
          image_url: string | null
          ingress: string
          published: boolean
          read_more_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          cta_type?: Database["public"]["Enums"]["cta_type"]
          cta_url?: string | null
          id?: string
          image_url?: string | null
          ingress?: string
          published?: boolean
          read_more_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          cta_type?: Database["public"]["Enums"]["cta_type"]
          cta_url?: string | null
          id?: string
          image_url?: string | null
          ingress?: string
          published?: boolean
          read_more_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_cards_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "card_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      prod_trainer_sessions: {
        Row: {
          booking_status: string | null
          company_name: string | null
          delivery_title: string | null
          ends_at: string | null
          location: string | null
          seq: number | null
          session_id: string | null
          session_title: string | null
          starts_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      ai_talent_participants: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      ai_talent_role: { Args: { _user_id: string }; Returns: string }
      cat_active_seats: { Args: { _offering: string }; Returns: number }
      cat_add_participant: {
        Args: { p_email: string; p_name: string; p_registration_id: string }
        Returns: string
      }
      cat_catalog_group_details: {
        Args: { p_offering: string; p_preview?: boolean }
        Returns: Json
      }
      cat_confirm_registration: {
        Args: { p_registration_id: string }
        Returns: number
      }
      cat_create_source_group: {
        Args: { p_config: Json; p_source: Json }
        Returns: string
      }
      cat_decide_go: {
        Args: { p_go: boolean; p_offering: string; p_reason: string }
        Returns: string
      }
      cat_evaluate_go: { Args: { p_offering: string }; Returns: string }
      cat_group_key: { Args: { _offering: string }; Returns: string }
      cat_group_status: { Args: { p_offering: string }; Returns: Json }
      cat_insert_party: { Args: { kind: string; p: Json }; Returns: string }
      cat_offer_from_waitlist: {
        Args: { p_offering_id: string }
        Returns: string
      }
      cat_program_form: { Args: { p_offering: string }; Returns: Json }
      cat_program_form_config: { Args: { p_slug: string }; Returns: Json }
      cat_program_form_config_v2: { Args: { p_slug: string }; Returns: Json }
      cat_public_catalog: { Args: { p_slug: string }; Returns: Json }
      cat_public_slugs: {
        Args: never
        Returns: {
          description: string
          name: string
          slug: string
        }[]
      }
      cat_register: {
        Args: {
          p_billing: Json
          p_buyer: Json
          p_marketing_consent: boolean
          p_offering_id: string
          p_participants: Json
          p_payer: Json
          p_privacy_version: string
          p_seats: number
          p_terms_accepted: boolean
        }
        Returns: Json
      }
      cat_register_program: {
        Args: { p_form: Json; p_offering: string }
        Returns: Json
      }
      cat_release_seat: { Args: { p_seat_id: string }; Returns: undefined }
      cat_sync_schedule: { Args: { p_offering: string }; Returns: number }
      cat_valid_business_id: { Args: { p: string }; Returns: boolean }
      cat_valid_party: {
        Args: { need_org: boolean; p: Json }
        Returns: boolean
      }
      company_attach_order: {
        Args: { p_id: string; p_order: string; p_template: string }
        Returns: string
      }
      company_capacity_approve: { Args: { p_id: string }; Returns: undefined }
      company_capacity_defects: { Args: { p: Json }; Returns: string[] }
      company_capacity_save: {
        Args: { p_capacity: Json; p_id: string }
        Returns: string
      }
      company_event: {
        Args: { p_id: string; p_kind: string; p_reason?: string }
        Returns: undefined
      }
      company_handoff_respond: {
        Args: {
          p_accept: boolean
          p_id: string
          p_order: string
          p_reason?: string
        }
        Returns: undefined
      }
      company_handoff_submit: {
        Args: { p_id: string; p_order: string }
        Returns: undefined
      }
      company_is_owner: { Args: { p_table: unknown }; Returns: boolean }
      company_latest: {
        Args: { p_id: string }
        Returns: {
          capacity: Json
          case_lead_id: string
          created_at: string
          created_by: string
          id: string
          production_owner_id: string
          programme: Json
          promises: string
          resource_list_verified: boolean
          resource_plan: Json
          responsible_trainer_id: string | null
          review_findings: Json
          revision: number
          sales_owner_id: string
          source_version_id: string | null
          state: string
        }
        SetofOptions: {
          from: "*"
          to: "prod_programme_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      company_my_trainer_programmes: {
        Args: never
        Returns: {
          capacity_approved: boolean
          ends_at: string
          id: string
          revision: number
          starts_at: string
          state: string
        }[]
      }
      company_my_trainer_programmes_with_company: {
        Args: never
        Returns: {
          capacity_approved: boolean
          company_name: string
          ends_at: string
          id: string
          revision: number
          starts_at: string
          state: string
        }[]
      }
      company_programme_approve: {
        Args: { p_id: string; p_review_note: string }
        Returns: undefined
      }
      company_programme_defects: { Args: { p_id: string }; Returns: string[] }
      company_programme_read: { Args: { p_id: string }; Returns: Json }
      company_programme_save: {
        Args: {
          p_capacity: Json
          p_case: string
          p_expected: string
          p_programme: Json
          p_receiver: string
          p_resource_verified: boolean
          p_resources: Json
          p_source?: string
          p_trainer: string
        }
        Returns: string
      }
      company_ready: {
        Args: { p_id: string; p_require_acceptance?: boolean }
        Returns: Json
      }
      company_require: {
        Args: { p_id: string; p_mode?: string }
        Returns: {
          capacity: Json
          case_lead_id: string
          created_at: string
          created_by: string
          id: string
          production_owner_id: string
          programme: Json
          promises: string
          resource_list_verified: boolean
          resource_plan: Json
          responsible_trainer_id: string | null
          review_findings: Json
          revision: number
          sales_owner_id: string
          source_version_id: string | null
          state: string
        }
        SetofOptions: {
          from: "*"
          to: "prod_programme_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      company_resource_defects: { Args: { p_id: string }; Returns: string[] }
      crm_confirm_company_order: {
        Args: {
          p_amount: number
          p_approval_method: string
          p_approval_note: string
          p_content: string
          p_ends_on: string
          p_idempotency_key: string
          p_lead_id: string
          p_offer_id: string
          p_payment_terms: string
          p_starts_on: string
          p_terms: string
          p_vat_basis: string
        }
        Returns: string
      }
      crm_confirm_order: {
        Args: { p_idempotency_key: string; p_version_id: string }
        Returns: string
      }
      crm_find_organization_candidates: {
        Args: { p_query: string }
        Returns: {
          business_id: string
          id: string
          match: string
          name: string
        }[]
      }
      crm_link_lead_customer: {
        Args: {
          p_contact_id: string
          p_expected_contact_id: string
          p_expected_organization_id: string
          p_lead_id: string
          p_new_business_id: string
          p_new_contact_email: string
          p_new_contact_name: string
          p_new_contact_phone: string
          p_new_organization_name: string
          p_op_key: string
          p_organization_id: string
        }
        Returns: Json
      }
      crm_normalize_business_id: { Args: { p: string }; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      dispatch_crm_emails: {
        Args: { callback_url: string; publishable_key: string }
        Returns: undefined
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      exp_approve_conflict: {
        Args: { p_id: string; p_reason: string }
        Returns: string
      }
      exp_cancel_assignment: {
        Args: { p_id: string; p_reason: string }
        Returns: undefined
      }
      exp_evaluate: {
        Args: { p_exclude: string; p_expert: string; p_session: string }
        Returns: Json
      }
      exp_is_own_expert: {
        Args: { _expert: string; _user: string }
        Returns: boolean
      }
      exp_log: {
        Args: {
          p_action: string
          p_assignment: string
          p_details: Json
          p_reason: string
        }
        Returns: undefined
      }
      exp_my_assignments: {
        Args: never
        Returns: {
          assignment_id: string
          delivery_mode: string
          delivery_title: string
          ends_at: string
          location: string
          needs_response: boolean
          session_title: string
          starts_at: string
          status: string
        }[]
      }
      exp_my_session_participants: {
        Args: { p_session: string }
        Returns: Json
      }
      exp_request_assignment: {
        Args: { p_expert: string; p_note?: string; p_session: string }
        Returns: string
      }
      exp_respond_assignment: {
        Args: { p_accept: boolean; p_id: string; p_note?: string }
        Returns: string
      }
      exp_try_confirm: { Args: { p_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ai_talent_admin: { Args: { _user_id: string }; Returns: boolean }
      is_editor_or_admin: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      mt_can_case: { Args: { p_lead: string }; Returns: boolean }
      pks_adviser_consume: {
        Args: {
          _global_limit: number
          _visitor: string
          _visitor_limit: number
        }
        Returns: boolean
      }
      prod_attendance_summary: {
        Args: { p_delivery: string }
        Returns: {
          hours: number
          name: string
          participant_id: string
          sessions_attended: number
          sessions_total: number
          sessions_unrecorded: number
        }[]
      }
      prod_create_delivery: {
        Args: {
          p_order_id: string
          p_production_owner?: string
          p_template_key: string
        }
        Returns: string
      }
      prod_create_group_delivery: {
        Args: { p_offering: string; p_production_owner?: string }
        Returns: string
      }
      prod_has_completed_sessions: {
        Args: { p_delivery: string }
        Returns: boolean
      }
      prod_is_session_trainer: {
        Args: { _session: string; _user: string }
        Returns: boolean
      }
      prod_my_trainer_tasks: {
        Args: never
        Returns: {
          company_name: string
          completed_at: string
          due_at: string
          id: string
          title: string
        }[]
      }
      prod_recompute: { Args: { _delivery: string }; Returns: undefined }
      prod_record_attendance: {
        Args: {
          p_hours: number
          p_note?: string
          p_participant: string
          p_session: string
          p_status: string
        }
        Returns: string
      }
      prod_sync_participants: { Args: { p_delivery: string }; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      staff_has_editor_role: { Args: { _user_id: string }; Returns: boolean }
      staff_member_is_staff: { Args: { _user_id: string }; Returns: boolean }
      staff_user_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "trainer"
      cta_type: "enroll" | "ask"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "trainer"],
      cta_type: ["enroll", "ask"],
    },
  },
} as const

