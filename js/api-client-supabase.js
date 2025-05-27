// API Client for Veterans Claims Portal using Supabase
import { supabase } from './supabase-config.js';

export async function submitClaim(claimData) {
  try {
    const { date, branch, claimType, sensitiveData, claimDetails, files } = claimData;
    
    // Insert claim
    const { data: claim, error } = await supabase
      .from('claims')
      .insert([{
        date,
        branch,
        claim_type: claimType,
        veteran_data: sensitiveData,
        claim_details: claimDetails,
        status: 'new',
        notes: []
      }])
      .select()
      .single();

    if (error) throw error;

    // Handle files if any
    if (files && files.length > 0) {
      for (const file of files) {
        // Upload file to storage
        const fileName = `${claim.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('claim-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('claim-files')
          .getPublicUrl(fileName);

        // Add file record
        const { error: fileRecordError } = await supabase
          .from('files')
          .insert({
            claim_id: claim.id,
            name: file.name,
            size: file.size,
            type: file.type,
            category: file.category || 'other_documents',
            url: publicUrl
          });

        if (fileRecordError) throw fileRecordError;
      }
    }

    return claim;
  } catch (error) {
    console.error('Error submitting claim:', error);
    throw error;
  }
}

export async function getClaims(userId = null) {
  try {
    let query = supabase
      .from('claims')
      .select(`
        *,
        files (
          id,
          name,
          size,
          type,
          upload_date,
          category,
          url
        )
      `)
      .order('date', { ascending: false });

    // If userId provided, filter by veteran_data user_id
    if (userId) {
      query = query.filter('veteran_data->user_id', 'eq', userId);
    }

    const { data: claims, error } = await query;
    
    if (error) throw error;

    // Decrypt sensitive data
    return claims.map(claim => ({
      ...claim,
      veteran_data: claim.veteran_data,
      claim_details: claim.claim_details
    }));
  } catch (error) {
    console.error('Error fetching claims:', error);
    throw error;
  }
}

export async function updateStatus(claimId, status, note) {
  try {
    // Get current claim to append notes
    const { data: currentClaim, error: getError } = await supabase
      .from('claims')
      .select('notes')
      .eq('id', claimId)
      .single();

    if (getError) throw getError;

    // Prepare notes array
    const existingNotes = currentClaim.notes || [];
    const newNote = {
      text: note,
      date: new Date().toISOString(),
      status: status,
      author: (await supabase.auth.getUser()).data.user.email
    };

    // Update claim status and notes
    const { data: updatedClaim, error: updateError } = await supabase
      .from('claims')
      .update({
        status: status,
        notes: [...existingNotes, newNote],
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedClaim;
  } catch (error) {
    console.error('Error updating claim status:', error);
    throw error;
  }
}

export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      user: data.user,
      role: userData.role,
      session: data.session
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export async function getUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
}

export async function deleteFile(fileId) {
  try {
    // Get file info first
    const { data: file, error: getError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (getError) throw getError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('claim-files')
      .remove([`${file.claim_id}/${file.name}`]);

    if (storageError) throw storageError;

    // Delete record
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
