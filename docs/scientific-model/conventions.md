# Scientific model requirements

P0 preview uses dimensionless display units and elapsed animation seconds. Its circular paths, radii and speeds are illustrative.

Before P2 implementation, P1 must freeze: stable body IDs and parent/barycenter IDs; physical units; reference frame and origin; epoch; input UTC and ephemeris time conversion policy; rotational orientation conventions; provider/version; valid time interval; uncertainty and null handling.

Proposed physical storage uses kilometers, seconds, radians and explicit frame metadata. Final ephemeris interoperability must be documented and validated before Scientific mode is enabled. UI UTC is not interchangeable with an ephemeris provider's dynamical time scale.

P6 acceptance requires reference samples, documented interpolation tolerances, boundary checks and handling of unavailable epochs. Unknown values stay null. Artistic textures and approximate shapes are labeled. Physical radius and visual radius must be separate fields. No scientific accuracy claim is made before this evidence exists.
