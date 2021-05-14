/**
 * A fast and easy mode to create a Vector in Unity
*/

public static partial class F
{
  /// <summary>
  /// Create a Vector2
  /// </summary>
  /// <param name="x">the x value</param>
  /// <param name="y">the y value</param>
  /// <returns>a new Vector2</returns>
  public static Vector2 V2(float x, float y) => new Vector2() { x = x, y = y };

  /// <summary>
  /// Create a Vector3
  /// </summary>
  /// <param name="x">the x value</param>
  /// <param name="y">the y value</param>
  /// <param name="z">the z value</param>
  /// <returns>a new Vector3</returns>
  public static Vector3 V3(float x, float y, float z) => new Vector3() { x = x, y = y, z = z };
}