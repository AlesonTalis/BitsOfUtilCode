/**
* a small method of clamp rotation on a certain value.
 * I know this is used a lot by me, 'cause I never - until now - got a PlayerController class up and running.
*/

public static partial class F
{
  
  /// <summary>
  /// clamp the rotation on the correct axis
  /// </summary>
  /// <param name="target">quaternion of the target object</param>
  /// <param name="clampActive">each axis with clamp required (3 values)</param>
  /// <param name="clampLimitMin">min clamp value</param>
  /// <param name="clampLimitMax">max clamp value</param>
  /// <returns>quaternion clamped</returns>
  public static Quaternion ClampApply(Quaternion target, bool[] clampActive, Vector3 clampLimitMin, Vector3 clampLimitMax)
  {
    if (clampActive.Length != 3)
    {
      List<bool> clamp = new List<bool>();

      for (int i = 0; i < 3; i++)
      {
        if (clampActive.Length > i)
          clamp[i] = clampActive[i];
        else
          clamp[i] = false;
      }

      clampActive = clamp.ToArray();
    }

    target.x /= target.w;
    target.y /= target.w;
    target.z /= target.w;
    target.w = 1.0f;

    if (clampActive[0])
      target.x = ClampAxis(target.x, F.V2(clampLimitMin.x, clampLimitMax.x));
    if (clampActive[1])
      target.y = ClampAxis(target.y, F.V2(clampLimitMin.y, clampLimitMax.y));
    if (clampActive[2])
      target.z = ClampAxis(target.z, F.V2(clampLimitMin.z, clampLimitMax.z));

    return target;
  }

  /// <summary>
  /// clamp the axis between the limits
  /// </summary>
  /// <param name="axis"></param>
  /// <param name="limits"></param>
  /// <returns></returns>
  private static float ClampAxis(float axis, Vector2 limits)
  {
    axis = 2.0f * Mathf.Rad2Deg * Mathf.Atan(axis);
    axis = Mathf.Clamp(axis, limits.x, limits.y);
    return Mathf.Tan(0.5f * Mathf.Deg2Rad * axis);
  }
}