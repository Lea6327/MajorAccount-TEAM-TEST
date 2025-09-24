using System.Collections.Concurrent;
using Property.Api.Models;

namespace Property.Api.Services;

/// <summary>
/// Minimal in-memory store for demo/testing:
/// - Create an auto-incremented id for a normalized property
/// - Read by id
/// - Update only the Volume/Folio pair and keep Status in sync
/// </summary>
public interface IPropertyStore
{
    StoredProperty Create(InternalProperty data);
    bool TryGet(int id, out StoredProperty stored);
    StoredProperty? UpdateVolumeFolio(int id, string? volume, string? folio);
}

/// <summary>Return shape when reading/writing the store.</summary>
public record StoredProperty(int Id, InternalProperty Data);

public class InMemoryPropertyStore : IPropertyStore
{
    // Thread-safe map of id -> property
    private readonly ConcurrentDictionary<int, InternalProperty> _db = new();

    // Monotonic id generator (thread-safe)
    private int _seq = 0;

    /// <summary>Create and assign a new id.</summary>
    public StoredProperty Create(InternalProperty data)
    {
        var id = Interlocked.Increment(ref _seq); // atomic ++
        _db[id] = data;
        return new StoredProperty(id, data);
    }

    /// <summary>Try read by id without throwing.</summary>
    public bool TryGet(int id, out StoredProperty stored)
    {
        if (_db.TryGetValue(id, out var data))
        {
            stored = new StoredProperty(id, data);
            return true;
        }
        stored = default!;
        return false;
    }

    /// <summary>
    /// Update Volume/Folio; blank -> null; recompute Status:
    /// - KnownVolFol when both present, else UnknownVolFol.
    /// Returns null when id doesn't exist.
    /// </summary>
    public StoredProperty? UpdateVolumeFolio(int id, string? volume, string? folio)
    {
        if (!_db.TryGetValue(id, out var current)) return null;

        // Normalize blanks to null
        var vol = string.IsNullOrWhiteSpace(volume) ? null : volume!.Trim();
        var fol = string.IsNullOrWhiteSpace(folio) ? null : folio!.Trim();

        // Derive status from availability
        var known  = !string.IsNullOrEmpty(vol) && !string.IsNullOrEmpty(fol);
        var status = known ? InternalProperty.Statuses.KnownVolFol
                           : InternalProperty.Statuses.UnknownVolFol;

        // Use record 'with' to keep immutability (InternalProperty is a record)
        var updated = current with { VolumeFolio = new VolumeFolio(vol, fol), Status = status };

        _db[id] = updated;
        return new StoredProperty(id, updated);
    }
}

