// lib/api-helpers.ts
import {NextResponse} from "next/server";
import {ZodSchema} from "zod";

// Standardised success response
export function success(data: any, status = 200) {
    return NextResponse.json(data, {status});
}

// Standardised error response
export function error(message: string, status = 500) {
    console.error(`API Error (Status ${status}): ${message}`);
    return NextResponse.json({error: message}, {status});
}

// Generic handler for fetching all items
export async function handleGetAll(fetcher: () => Promise<any[]>, type: string) {
    try {
        console.log(`Fetching all ${type}...`);
        const items = await fetcher();
        console.log(`Successfully fetched ${items.length} ${type}`);
        return success(items);
    } catch (err) {
        return error(`Failed to fetch ${type}: ${(err as Error).message}`);
    }
}

// Generic handler for creating an item with validation
export async function handleCreate<T>(
    creator: (data: T) => Promise<any>,
    data: T,
    schema: ZodSchema<T>,
    type: string
) {
    try {
        console.log(`Creating new ${type} with data:`, data);
        const validation = schema.safeParse(data);
        if (!validation.success) {
            console.error(`Validation failed for ${type}:`, validation.error.issues);
            return error(`Invalid ${type} data: ${validation.error.issues.map(e => e.message).join(', ')}`, 400);
        }
        console.log(`Creating new ${type}...`);
        const newItem = await creator(validation.data);
        console.log(`Successfully created ${type}: ${newItem.name || newItem.title}`);
        return success(newItem, 201);
    } catch (err) {
        return error(`Failed to create ${type}: ${(err as Error).message}`);
    }
}

// Generic handler for fetching an item by ID
export async function handleGetById(fetcher: (id: string) => Promise<any>, id: string, type: string) {
    try {
        console.log(`Fetching ${type} with ID: ${id}`);
        const item = await fetcher(id);
        if (!item) {
            return error(`${type} not found`, 404);
        }
        console.log(`Successfully fetched ${type}: ${item.name || item.title}`);
        return success(item);
    } catch (err) {
        return error(`Failed to fetch ${type}: ${(err as Error).message}`);
    }
}

// Generic handler for updating an item with validation
export async function handleUpdate<T>(
    updater: (id: string, data: Partial<T>) => Promise<any>,
    id: string,
    data: Partial<T>,
    schema: ZodSchema<Partial<T>>,
    type: string
) {
    try {
        console.log(`Updating ${type} with ID: ${id}`);
        console.log(`Update data received:`, data);

        const validation = schema.safeParse(data);
        if (!validation.success) {
            console.error(`Validation failed for ${type} update:`, validation.error);
            console.error(`Validation data was:`, data);

            // Safe error message handling
            const errorMessages = validation.error.issues?.map(issue =>
                `${issue.path.join('.')}: ${issue.message}`
            ).join(', ') || 'Validation failed';

            return error(`Invalid ${type} data for update: ${errorMessages}`, 400);
        }

        console.log(`Validated data for ${type}:`, validation.data);
        const updatedItem = await updater(id, validation.data);
        if (!updatedItem) {
            return error(`${type} not found for update`, 404);
        }
        console.log(`Successfully updated ${type}: ${updatedItem.name || updatedItem.title}`);
        return success(updatedItem);
    } catch (err) {
        console.error(`Error updating ${type}:`, err);
        return error(`Failed to update ${type}: ${(err as Error).message}`);
    }
}

// Generic handler for deleting an item
export async function handleDelete(deleter: (id: string) => Promise<boolean>, id: string, type: string) {
    try {
        console.log(`Deleting ${type} with ID: ${id}`);
        const successFlag = await deleter(id);
        if (!successFlag) {
            return error(`${type} not found for deletion`, 404);
        }
        console.log(`Successfully deleted ${type}: ${id}`);
        return success({success: true});
    } catch (err) {
        return error(`Failed to delete ${type}: ${(err as Error).message}`);
    }
}